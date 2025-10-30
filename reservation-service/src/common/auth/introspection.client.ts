interface CacheEntry<T> {
  value: T;
  expires: number;
}

export interface RemoteIntrospectionResult {
  active: boolean;
  sub?: string;
  role?: string;
  username?: string;
  exp?: number;
  iat?: number;
}

export class IntrospectionClient {
  private cache = new Map<string, CacheEntry<RemoteIntrospectionResult>>();
  constructor(
    private readonly url: string,
    private readonly ttlMs: number = 30000,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

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
