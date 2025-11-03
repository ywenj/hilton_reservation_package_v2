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
    c.dispose();
  });

  it("expires cache after TTL", async () => {
    let calls = 0;
    const fakeFetch: any = async () => {
      calls++;
      return {
        ok: true,
        json: async () => ({ active: true, sub: "u2", role: "guest" }),
      };
    };
    const ttl = 30;
    const c = new IntrospectionClient("http://fake", ttl, fakeFetch);
    await c.introspect("tok");
    await c.introspect("tok");
    expect(calls).toBe(1);
    await new Promise((r) => setTimeout(r, ttl + 5));
    await c.introspect("tok");
    expect(calls).toBe(2);
    c.dispose();
  });

  it("dispose clears internal interval", async () => {
    let calls = 0;
    const fakeFetch: any = async () => {
      calls++;
      return { ok: true, json: async () => ({ active: true }) };
    };
    const c = new IntrospectionClient("http://fake", 10, fakeFetch);
    await c.introspect("tok");
    c.dispose();
    // @ts-expect-error accessing private field for test inspection
    expect(c.cleanupHandle).toBeUndefined();
  });
});
