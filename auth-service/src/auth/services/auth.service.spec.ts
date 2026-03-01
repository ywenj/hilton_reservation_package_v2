import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { getModelToken } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

/** Helper: build a fake UserDocument with save() */
function fakeUserDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: "user-id-1",
    username: "testuser",
    password: "hashed-pw",
    role: "guest",
    email: "test@example.com",
    phone: "1234567890",
    save: jest.fn().mockResolvedValue(undefined),
    toString: () => overrides._id?.toString() ?? "user-id-1",
    ...overrides,
  };
}

describe("AuthService", () => {
  let service: AuthService;
  let userModel: jest.Mock & { findOne: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    // Model is used both as injectable (findOne) and as constructor (new Model())
    const fn = jest
      .fn()
      .mockImplementation((data: Record<string, unknown>) =>
        fakeUserDoc(data),
      ) as jest.Mock & { findOne: jest.Mock; create: jest.Mock };
    fn.findOne = jest.fn();
    fn.create = jest.fn();
    userModel = fn;

    jwtService = { sign: jest.fn().mockReturnValue("jwt-token") };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: getModelToken("User"), useValue: userModel },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Silence logger in tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = service as any;
    jest.spyOn(svc.logger, "log").mockImplementation(() => {});
    jest.spyOn(svc.logger, "warn").mockImplementation(() => {});
    jest.spyOn(svc.logger, "debug").mockImplementation(() => {});
    jest.spyOn(svc.logger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ====================================================================
  // register()
  // ====================================================================
  describe("register", () => {
    it("should register a new user with hashed password", async () => {
      userModel.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue("hashed-pw" as never);

      const result = await service.register("newuser", "pass123", "guest");

      expect(userModel.findOne).toHaveBeenCalledWith({ username: "newuser" });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith("pass123", 10);
      expect(result).toEqual(
        expect.objectContaining({ username: "newuser", role: "guest" }),
      );
    });

    it("should default role to 'guest'", async () => {
      userModel.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue("hashed-pw" as never);

      const result = await service.register("u1", "pw");

      expect(result.role).toBe("guest");
    });

    it("should throw BadRequestException if username exists", async () => {
      userModel.findOne.mockResolvedValue(fakeUserDoc());

      await expect(service.register("existing", "pass123")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ====================================================================
  // validateUser()
  // ====================================================================
  describe("validateUser", () => {
    it("should return user when password matches", async () => {
      const user = fakeUserDoc();
      userModel.findOne.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser("testuser", "correct-pw");

      expect(result).toBe(user);
    });

    it("should return null when user not found", async () => {
      userModel.findOne.mockResolvedValue(null);

      const result = await service.validateUser("nouser", "pw");

      expect(result).toBeNull();
    });

    it("should return null when password does not match", async () => {
      userModel.findOne.mockResolvedValue(fakeUserDoc());
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser("testuser", "wrong-pw");

      expect(result).toBeNull();
    });
  });

  // ====================================================================
  // registerEmployee()
  // ====================================================================
  describe("registerEmployee", () => {
    it("should register an employee with role 'employee'", async () => {
      userModel.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue("hashed-pw" as never);

      const result = await service.registerEmployee("emp1", "pass");

      expect(mockedBcrypt.hash).toHaveBeenCalledWith("pass", 10);
      expect(result).toEqual(
        expect.objectContaining({ username: "emp1", role: "employee" }),
      );
    });

    it("should throw BadRequestException if employee username exists", async () => {
      userModel.findOne.mockResolvedValue(fakeUserDoc({ role: "employee" }));

      await expect(service.registerEmployee("emp1", "pass")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException on MongoDB duplicate key (11000)", async () => {
      userModel.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue("hashed-pw" as never);
      // Simulate save() throwing duplicate key
      const duplicateError = Object.assign(new Error("dup"), { code: 11000 });
      userModel.mockImplementation(() => ({
        ...fakeUserDoc(),
        save: jest.fn().mockRejectedValue(duplicateError),
      }));

      await expect(service.registerEmployee("emp1", "pass")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should re-throw non-duplicate errors", async () => {
      userModel.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue("hashed-pw" as never);
      const genericError = new Error("DB connection lost");
      userModel.mockImplementation(() => ({
        ...fakeUserDoc(),
        save: jest.fn().mockRejectedValue(genericError),
      }));

      await expect(service.registerEmployee("emp1", "pass")).rejects.toThrow(
        "DB connection lost",
      );
    });
  });

  // ====================================================================
  // registerGuest()
  // ====================================================================
  describe("registerGuest", () => {
    it("should register a guest with email", async () => {
      userModel.findOne.mockResolvedValue(null);

      const result = await service.registerGuest({
        username: "guest1",
        email: "G@EXAMPLE.com",
      });

      expect(result).toEqual(
        expect.objectContaining({ username: "guest1", role: "guest" }),
      );
    });

    it("should register a guest with phone", async () => {
      userModel.findOne.mockResolvedValue(null);

      const result = await service.registerGuest({
        username: "guest2",
        phone: "9876543210",
      });

      expect(result).toEqual(
        expect.objectContaining({ username: "guest2", role: "guest" }),
      );
    });

    it("should throw if username is missing", async () => {
      await expect(service.registerGuest({ email: "a@b.com" })).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw if both email and phone are missing", async () => {
      await expect(service.registerGuest({ username: "u1" })).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw if username already exists", async () => {
      userModel.findOne.mockResolvedValueOnce(fakeUserDoc()); // username check

      await expect(
        service.registerGuest({ username: "taken", email: "a@b.com" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if email already exists", async () => {
      userModel.findOne
        .mockResolvedValueOnce(null) // username check
        .mockResolvedValueOnce(fakeUserDoc()); // email check

      await expect(
        service.registerGuest({ username: "new", email: "taken@b.com" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if phone already exists", async () => {
      userModel.findOne
        .mockResolvedValueOnce(null) // username check
        .mockResolvedValueOnce(null) // email check (skipped if no email)
        .mockResolvedValueOnce(fakeUserDoc()); // phone check

      await expect(
        service.registerGuest({
          username: "new",
          email: "ok@b.com",
          phone: "000",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException on duplicate key (11000)", async () => {
      userModel.findOne.mockResolvedValue(null);
      const duplicateError = Object.assign(new Error("dup"), { code: 11000 });
      userModel.mockImplementation(() => ({
        ...fakeUserDoc(),
        save: jest.fn().mockRejectedValue(duplicateError),
      }));

      await expect(
        service.registerGuest({ username: "g", email: "x@x.com" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ====================================================================
  // loginEmployee()
  // ====================================================================
  describe("loginEmployee", () => {
    it("should return JWT token on valid credentials", async () => {
      const user = fakeUserDoc({ role: "employee" });
      userModel.findOne.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.loginEmployee("emp1", "pass");

      expect(userModel.findOne).toHaveBeenCalledWith({
        username: "emp1",
        role: "employee",
      });
      expect(result).toEqual({ access_token: "jwt-token" });
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ role: "employee" }),
      );
    });

    it("should return null if employee not found", async () => {
      userModel.findOne.mockResolvedValue(null);

      const result = await service.loginEmployee("noone", "pass");

      expect(result).toBeNull();
    });

    it("should return null if password does not match", async () => {
      userModel.findOne.mockResolvedValue(fakeUserDoc({ role: "employee" }));
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.loginEmployee("emp1", "wrong");

      expect(result).toBeNull();
    });
  });

  // ====================================================================
  // loginGuest()
  // ====================================================================
  describe("loginGuest", () => {
    it("should return JWT token when logging in by email", async () => {
      const user = fakeUserDoc({ role: "guest", email: "g@example.com" });
      userModel.findOne.mockResolvedValue(user);

      const result = await service.loginGuest("G@EXAMPLE.COM");

      expect(userModel.findOne).toHaveBeenCalledWith({
        role: "guest",
        email: "g@example.com",
      });
      expect(result).toEqual({ access_token: "jwt-token" });
    });

    it("should return JWT token when logging in by phone", async () => {
      const user = fakeUserDoc({ role: "guest", phone: "123" });
      userModel.findOne.mockResolvedValue(user);

      const result = await service.loginGuest(undefined, "123");

      expect(userModel.findOne).toHaveBeenCalledWith({
        role: "guest",
        phone: "123",
      });
      expect(result).toEqual({ access_token: "jwt-token" });
    });

    it("should return null if neither email nor phone provided", async () => {
      const result = await service.loginGuest();

      expect(result).toBeNull();
      expect(userModel.findOne).not.toHaveBeenCalled();
    });

    it("should return null if guest not found", async () => {
      userModel.findOne.mockResolvedValue(null);

      const result = await service.loginGuest("no@one.com");

      expect(result).toBeNull();
    });
  });
});
