/// <reference types="jest" />
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Test } from "@nestjs/testing";
import { GraphQLModule, Query, Resolver } from "@nestjs/graphql";
import { join } from "path";
import { Module } from "@nestjs/common";
import request from "supertest";

@Resolver()
class DummyResolver {
  @Query(() => String)
  ping(): string {
    return "pong";
  }
}

@Module({ providers: [DummyResolver] })
class DummyModule {}

// Minimal fetch mock support via globalThis
const ACTIVE_TOKEN = "good-token";
const INACTIVE_TOKEN = "bad-token";

const fetchMock = async (url: string, init?: any) => {
  const body = JSON.parse(init?.body || "{}");
  if (body.token === ACTIVE_TOKEN) {
    return {
      ok: true,
      json: async () => ({ active: true, sub: "u123", role: "guest" }),
    } as any;
  }
  return { ok: true, json: async () => ({ active: false }) } as any;
};

describe("GraphQL context introspection", () => {
  let app: any;

  beforeAll(async () => {
    process.env.AUTH_INTROSPECTION_URL = "http://auth/introspect";
    process.env.INTROSPECTION_CACHE_TTL_MS = "1000";
    const testingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), "test/schema.gql"),
          context: async ({ req }: { req: any }) => {
            const auth = req.headers?.authorization || "";
            const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
            let user = null;
            if (token) {
              const { IntrospectionClient } = await import(
                "../src/common/auth/introspection.client"
              );
              // 使用 cache-manager 注入方式：构造时需要模拟 cache
              const cacheMock: any = {
                get: jest.fn(async () => undefined),
                set: jest.fn(async () => undefined),
              };
              const client = new IntrospectionClient(cacheMock);
              client.url = process.env.AUTH_INTROSPECTION_URL!;
              client.ttlMs = 1000;
              client.fetchImpl = fetchMock as any;
              const r = await client.introspect(token);
              if (r.active) user = { sub: r.sub, role: r.role };
            }
            return { req, user };
          },
        }),
        DummyModule,
      ],
    }).compile();
    app = await testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllTimers();
    try {
      const mongoose = require("mongoose");
      if (mongoose.connection && mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch {}
  });

  it("injects user for active token", async () => {
    const httpServer = app.getHttpServer();
    const res = await request(httpServer)
      .post("/graphql")
      .set("Authorization", `Bearer ${ACTIVE_TOKEN}`)
      .send({ query: "{ ping }" });
    expect(res.status).toBe(200);
    expect(res.body.data.ping).toBe("pong");
  });

  it("no user for inactive token", async () => {
    const httpServer = app.getHttpServer();
    const res = await request(httpServer)
      .post("/graphql")
      .set("Authorization", `Bearer ${INACTIVE_TOKEN}`)
      .send({ query: "{ ping }" });
    expect(res.status).toBe(200);
    expect(res.body.data.ping).toBe("pong");
  });
});
