import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

export interface RemoteIntrospectionResult {
  active: boolean;
  sub?: string;
  role?: string;
  username?: string;
  email?: string;
  phone?: string;
  exp?: number;
  iat?: number;
}

@Injectable()
export class IntrospectionClient {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  // 通过工厂提供的配置（module provider）注入，可在实例上动态设置。
  url: string = process.env.AUTH_INTROSPECTION_URL || "";
  ttlMs: number = Number(process.env.INTROSPECTION_CACHE_TTL_MS) || 30000;
  fetchImpl: typeof fetch = fetch;

  async introspect(token: string): Promise<RemoteIntrospectionResult> {
    if (!token) return { active: false };
    const key = `introspect:${token}`;
    const cached = await this.cache.get<RemoteIntrospectionResult>(key);
    if (cached) return cached;
    const effectiveTtl =
      Number.isFinite(this.ttlMs) && this.ttlMs > 0 ? this.ttlMs : 30000;
    const res = await this.fetchImpl(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return { active: false };
    const json = (await res.json()) as RemoteIntrospectionResult;
    // cache-manager ttl 单位为秒
    await this.cache.set(key, json, Math.ceil(effectiveTtl / 1000));
    return json;
  }
}
