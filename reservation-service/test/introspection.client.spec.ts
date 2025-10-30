/// <reference types="jest" />
import { IntrospectionClient } from "../src/common/auth/introspection.client";

describe("IntrospectionClient", () => {
  it("inactive when token empty", async () => {
    const c = new IntrospectionClient("http://fake");
    expect(await c.introspect("")).toEqual({ active: false });
  });

  it("caches active token result", async () => {
    let calls = 0;
    const fakeFetch: any = async () => {
      calls++;
      return {
        ok: true,
        json: async () => ({ active: true, sub: "u1", role: "guest" }),
      };
    };
    const c = new IntrospectionClient("http://fake", 5000, fakeFetch);
    const first = await c.introspect("t1");
    const second = await c.introspect("t1");
    expect(first.active).toBe(true);
    expect(second.sub).toBe("u1");
    expect(calls).toBe(1); // second call should hit cache
  });
});
