import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { getModelToken } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";

describe("AuthService", () => {
  let service: AuthService;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        { provide: getModelToken("User"), useValue: userModel },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    if ((service as any).logger) {
      jest.spyOn((service as any).logger, "log");
      jest.spyOn((service as any).logger, "warn");
      jest.spyOn((service as any).logger, "debug");
      jest.spyOn((service as any).logger, "error");
    }
  });

  it("registerEmployee rejects duplicate username", async () => {
    userModel.findOne.mockResolvedValue({ _id: "1", username: "emp" });
    await expect(
      service.registerEmployee("emp", "password123")
    ).rejects.toThrow();
    if ((service as any).logger) {
      expect((service as any).logger.debug).toHaveBeenCalled();
      expect((service as any).logger.warn).toHaveBeenCalled();
    }
  });
});
