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
  });

  it("registerEmployee rejects duplicate username", async () => {
    userModel.findOne.mockResolvedValue({ _id: "1", username: "emp" });
    await expect(
      service.registerEmployee("emp", "password123")
    ).rejects.toThrow();
  });
});
