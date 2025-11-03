import { Injectable, OnModuleDestroy } from "@nestjs/common";
interface CacheEntry<T> {
  value: T;
  expires: number;
}

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
export class IntrospectionClient implements OnModuleDestroy {
  private cache = new Map<string, CacheEntry<RemoteIntrospectionResult>>();
  // 定期清理已过期的缓存项（否则它们虽然不会命中，但会一直占内存）
  // 使用 ReturnType<typeof setInterval> 以兼容不同运行环境 (Node / Browser typings)
  private cleanupHandle?: ReturnType<typeof setInterval>;
  constructor(
    private readonly url: string,
    private readonly ttlMs: number = 30000,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly minCleanupIntervalMs: number = 1000
  ) {
    // 规范化 TTL，避免传入负数或 0 导致频繁触发
    if (!Number.isFinite(this.ttlMs) || this.ttlMs < 0) {
      (this as any).ttlMs = 30000; // fallback
    }
    this.startCleanupLoop();
  }

  private startCleanupLoop() {
    const intervalMs = Math.max(this.ttlMs, this.minCleanupIntervalMs);
    this.cleanupHandle = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache) {
        if (entry.expires <= now) {
          this.cache.delete(key);
        }
      }
    }, intervalMs);
  }

  /**
   * 主动释放内部资源（清理 interval 与缓存）。
   * 应在应用关闭阶段调用，避免进程保持活动或出现内存泄漏。
   */
  dispose() {
    if (this.cleanupHandle) {
      clearInterval(this.cleanupHandle);
      this.cleanupHandle = undefined;
    }
    this.cache.clear();
  }

  onModuleDestroy() {
    this.dispose();
  }

  async introspect(token: string): Promise<RemoteIntrospectionResult> {
    if (!token) return { active: false };
    const now = Date.now();
    const cached = this.cache.get(token);
    if (cached && cached.expires > now) return cached.value;
    const res = await this.fetchImpl(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return { active: false };
    const json = (await res.json()) as RemoteIntrospectionResult;
    this.cache.set(token, { value: json, expires: now + this.ttlMs });
    return json;
  }
}
