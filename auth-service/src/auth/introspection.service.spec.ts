import { Test } from "@nestjs/testing";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { IntrospectionService } from "./introspection.service";

describe("IntrospectionService", () => {
  let service: IntrospectionService;
  let jwt: JwtService;
  const secret = "test-secret";

  beforeAll(async () => {
    process.env.JWT_SECRET = secret;
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret, signOptions: { expiresIn: 2 } })],
      providers: [IntrospectionService],
    }).compile();
    service = module.get(IntrospectionService);
    jwt = module.get(JwtService);
  });

  it("returns active true for valid token", () => {
    const token = jwt.sign({ sub: "u1", role: "guest", username: "alice" });
    const res = service.introspect(token);
    expect(res.active).toBe(true);
    expect(res.sub).toBe("u1");
    expect(res.role).toBe("guest");
  });

  it("returns active false for invalid token", () => {
    const res = service.introspect("not-a-token");
    expect(res.active).toBe(false);
  });

  it("returns inactive for expired token", async () => {
    const shortJwt = await jwt.signAsync(
      { sub: "u2", role: "guest" },
      { expiresIn: 1 }
    );
    await new Promise((r) => setTimeout(r, 1100));
    const res = service.introspect(shortJwt);
    expect(res.active).toBe(false);
  });
});
