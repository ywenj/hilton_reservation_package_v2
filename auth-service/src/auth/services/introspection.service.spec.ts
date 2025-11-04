import { Test } from "@nestjs/testing";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { IntrospectionService } from "./introspection.service";
import { getModelToken } from "@nestjs/mongoose";

describe("IntrospectionService", () => {
  let service: IntrospectionService;
  let jwt: JwtService;
  const secret = "test-secret";

  const userModelMock = {
    findById: jest.fn(),
  } as any;

  beforeAll(async () => {
    process.env.JWT_SECRET = secret;
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret, signOptions: { expiresIn: 2 } })],
      providers: [
        IntrospectionService,
        { provide: getModelToken("User"), useValue: userModelMock },
      ],
    }).compile();
    service = module.get(IntrospectionService);
    jwt = module.get(JwtService);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  beforeEach(() => {
    userModelMock.findById.mockReset();
  });

  it("returns active true with email/phone for valid token and existing user", async () => {
    userModelMock.findById.mockReturnValue({
      lean: () => ({
        _id: "u1",
        role: "guest",
        username: "alice",
        email: "a@example.com",
        phone: "123",
      }),
    });
    const token = jwt.sign({ sub: "u1", role: "guest", username: "alice" });
    const res = await service.introspect(token);
    expect(res.active).toBe(true);
    expect(res.sub).toBe("u1");
    expect(res.role).toBe("guest");
    expect(res.email).toBe("a@example.com");
    expect(res.phone).toBe("123");
  });

  it("inactive when user not found", async () => {
    userModelMock.findById.mockReturnValue({ lean: () => null });
    const token = jwt.sign({ sub: "u-missing", role: "guest" });
    const res = await service.introspect(token);
    expect(res.active).toBe(false);
  });

  it("returns inactive for expired token", async () => {
    const shortJwt = await jwt.signAsync(
      { sub: "u2", role: "guest" },
      { expiresIn: 1 }
    );
    await new Promise((r) => setTimeout(r, 1100));
    const res = await service.introspect(shortJwt);
    expect(res.active).toBe(false);
  });

  it("returns inactive for malformed token", async () => {
    const res = await service.introspect("not-a-token");
    expect(res.active).toBe(false);
  });
});
