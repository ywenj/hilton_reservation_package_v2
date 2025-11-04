import { Test } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "../services/auth.service";
import { IntrospectionService } from "../services/introspection.service";
import { BadRequestException } from "@nestjs/common";

describe("AuthController", () => {
  let controller: AuthController;
  const authServiceMock = {
    registerEmployee: jest.fn(),
    registerGuest: jest.fn(),
    loginEmployee: jest.fn(),
    loginGuest: jest.fn(),
  } as any;
  const introspectionServiceMock = { introspect: jest.fn() } as any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: IntrospectionService, useValue: introspectionServiceMock },
      ],
    }).compile();
    controller = moduleRef.get(AuthController);
    jest.clearAllMocks();
    // Spy logger if exists
    if ((controller as any).logger) {
      jest.spyOn((controller as any).logger, "log");
      jest.spyOn((controller as any).logger, "debug");
      jest.spyOn((controller as any).logger, "warn");
    }
  });

  it("registerEmployee delegates to service", async () => {
    authServiceMock.registerEmployee.mockResolvedValue({ id: "1" });
    const res = await controller.registerEmployee({
      username: "u",
      password: "p",
    } as any);
    expect(res).toEqual({ id: "1" });
    expect(authServiceMock.registerEmployee).toHaveBeenCalledWith("u", "p");
    if ((controller as any).logger) {
      expect((controller as any).logger.log).toHaveBeenCalled();
    }
  });

  it("registerGuest throws when both email and phone missing", async () => {
    await expect(
      controller.registerGuest({ username: "guest1" } as any)
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(authServiceMock.registerGuest).not.toHaveBeenCalled();
  });

  it("registerGuest delegates when email provided", async () => {
    authServiceMock.registerGuest.mockResolvedValue({ id: "g1" });
    const res = await controller.registerGuest({
      username: "g",
      email: "a@b.com",
    } as any);
    expect(res).toEqual({ id: "g1" });
    expect(authServiceMock.registerGuest).toHaveBeenCalledWith({
      email: "a@b.com",
      phone: undefined,
      username: "g",
    });
  });

  it("loginEmployee returns error object for invalid credentials", async () => {
    authServiceMock.loginEmployee.mockResolvedValue(null);
    const res = await controller.loginEmployee({
      username: "emp",
      password: "bad",
    } as any);
    expect(res).toEqual({ error: "invalid credentials" });
  });

  it("loginEmployee returns token object for valid credentials", async () => {
    authServiceMock.loginEmployee.mockResolvedValue({ access_token: "abc" });
    const res = await controller.loginEmployee({
      username: "emp",
      password: "good",
    } as any);
    expect(res).toEqual({ access_token: "abc" });
    if ((controller as any).logger) {
      expect((controller as any).logger.log).toHaveBeenCalled();
    }
  });

  it("loginGuest returns error object when neither email nor phone matches", async () => {
    authServiceMock.loginGuest.mockResolvedValue(null);
    const res = await controller.loginGuest({ email: "x@x.com" } as any);
    expect(res).toEqual({ error: "invalid credentials" });
  });

  it("loginGuest returns token object when match found", async () => {
    authServiceMock.loginGuest.mockResolvedValue({
      access_token: "guest-token",
    });
    const res = await controller.loginGuest({ email: "y@y.com" } as any);
    expect(res).toEqual({ access_token: "guest-token" });
    if ((controller as any).logger) {
      expect((controller as any).logger.log).toHaveBeenCalled();
    }
  });

  it("introspect delegates to introspectionService", async () => {
    introspectionServiceMock.introspect.mockResolvedValue({
      active: true,
      sub: "u1",
    });
    const res = await controller.introspect({ token: "tok" } as any);
    expect(res).toEqual({ active: true, sub: "u1" });
    expect(introspectionServiceMock.introspect).toHaveBeenCalledWith("tok");
    if ((controller as any).logger) {
      expect((controller as any).logger.debug).toHaveBeenCalled();
    }
  });
});
