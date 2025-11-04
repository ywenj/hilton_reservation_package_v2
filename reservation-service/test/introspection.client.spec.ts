/// <reference types="jest" />
import { IntrospectionClient } from "../src/common/auth/introspection.client";
import type { Cache } from "cache-manager";

function createClient(
  opts: {
    fetchImpl?: any;
    ttlMs?: number;
    url?: string;
    cache?: Cache;
  } = {}
) {
  const cache: Cache =
    opts.cache ||
    ({
      store: "memory",
      get: jest.fn(async () => undefined),
      set: jest.fn(async () => undefined),
    } as any);
  const c = new IntrospectionClient(cache as any);
  c.url = opts.url || "http://fake";
  c.ttlMs = opts.ttlMs ?? 30000;
  c.fetchImpl =
    opts.fetchImpl ||
    (async () => ({ ok: true, json: async () => ({ active: true }) }));
  return { c, cache };
}

describe("IntrospectionClient", () => {
  it("inactive when token empty", async () => {
    const { c } = createClient();
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
    const { c, cache } = createClient({ ttlMs: 5000, fetchImpl: fakeFetch });
    // First call: cache miss -> fetch
    const first = await c.introspect("t1");
    (cache.get as any).mockResolvedValue(first); // simulate cache hit for second call
    const second = await c.introspect("t1");
    expect(first.active).toBe(true);
    expect(second.sub).toBe("u1");
    expect(calls).toBe(1);
  });

  it("expires cache after TTL (simulated)", async () => {
    let calls = 0;
    const fakeFetch: any = async () => {
      calls++;
      return {
        ok: true,
        json: async () => ({ active: true, sub: "u2", role: "guest" }),
      };
    };
    const { c, cache } = createClient({ ttlMs: 50, fetchImpl: fakeFetch });
    // miss
    const v1 = await c.introspect("tok");
    (cache.get as any).mockResolvedValue(v1);
    const v2 = await c.introspect("tok");
    expect(calls).toBe(1);
    // Simulate TTL expiry: next get returns undefined
    (cache.get as any).mockResolvedValueOnce(undefined);
    const v3 = await c.introspect("tok");
    expect(calls).toBe(2);
    expect(v3.active).toBe(true);
  });

  it("returns inactive when remote not ok", async () => {
    const badFetch: any = async () => ({ ok: false });
    const { c } = createClient({ fetchImpl: badFetch });
    const r = await c.introspect("abc");
    expect(r.active).toBe(false);
  });
});
