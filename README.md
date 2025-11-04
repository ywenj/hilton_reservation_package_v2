# Hilton Reservation — 打包脚手架（v2）

本项目提供一个示例性的「预订（Reservation）」全栈结构：后端采用 NestJS + GraphQL + Mongoose，前端采用 React + Vite + Apollo Client，并包含一个用于 JWT 校验/用户角色管理的独立认证服务（auth-service）。当前版本（v2）在单元测试、Schema 示例、按钮/状态管理以及更清晰的角色分离方面做了增强。

> 说明：以下文档为原英文 README 的中文翻译与结构化 Markdown 版本；环境变量与字段名等技术标识保留英文。

---

## 🔧 核心说明

1. `docker-compose.yml` 中使用了一个本地 MongoDB 容器，作为开发阶段对 Azure Cosmos DB（MongoDB API 模式）的替代。
2. 若要接入真实的 Azure Cosmos DB，请在 `reservation-service/.env`（或 backend/.env）里设置：`COSMOS_MONGO_URI=<Cosmos 连接串>`，并移除/忽略本地 mongo 服务。
3. 后端 GraphQL 输入类型使用 `@nestjs/graphql` + `class-validator` 做了严格校验。
4. 单元测试示例展示了如何用 `jest-mock-extended` 来 mock Mongoose Model；本地运行时可根据需要进一步补充。

---

## 🆕 Changelog v2

- 新增 `schema.gql` 示例文件（GraphQL Schema Snapshot）。
- 改进单元测试：mock Mongoose 模型方法，减少真实 DB 依赖。
- 调整 backend Dockerfile 以便更顺畅的开发运行（dev run）。

---

## 🔐 认证与环境（Reservation Service）

在 `reservation-service/.env` 中需要设置（示例）：

```env
COSMOS_MONGO_URI=mongodb://localhost:27017/hilton_reservations
JWT_SECRET=change_me_dev
CORS_ORIGINS=http://localhost:5173
```

- `JWT_SECRET`：用于本地直接验证 Token（开发默认值 `dev-secret` 仅供本地使用，勿用于生产）。
- 也可以切换为「Introspection 模式」由 `auth-service` 统一校验（见下节）。

---

## 🔍 Introspection 模式（与 Auth-Service 集成）

与其在 reservation-service 内部直接 `jwt.verify`，可改为调用 `auth-service` 的 `POST /auth/introspect`：

在 `reservation-service/.env` 增加：

```env
AUTH_INTROSPECTION_URL=http://localhost:3001/auth/introspect
INTROSPECTION_CACHE_TTL_MS=30000
```

调用流程：

1. 从请求头中抽取 `Authorization: Bearer <token>`。
2. 发送 `POST { token }` 至 introspection URL。
3. 返回 `active=true` 时，将 `{ sub, role, username? }` 附着到请求上下文作为当前用户。
4. 后续 GraphQL Guard 只检查角色；无需本地解析签名。

接口契约（auth-service）：

```http
POST /auth/introspect
Body: { token: string }
Response: {
  active: boolean,
  sub?: string,
  role?: 'guest' | 'employee',
  username?: string,
  exp?: number,
  iat?: number
}
```

---

## 🔑 GraphQL 授权使用（Reservation Service）

客户端需在请求头添加：

```
Authorization: Bearer <jwt>
```

Token 载荷（payload）需包含：

```json
{ "sub": "<userId>", "role": "guest" | "employee" }
```

主要操作与角色限制：

| 操作                    | 说明                                   | 角色               |
| ----------------------- | -------------------------------------- | ------------------ |
| `myReservations`        | 当前用户（或员工查看全部？视实现而定） | guest / employee   |
| `reservations` (带过滤) | 预约列表管理                           | employee           |
| `createReservation`     | 创建预约（自动关联 token 中 userId）   | guest / employee   |
| `updateReservation`     | 更新预约                               | employee（或受限） |
| `setReservationStatus`  | 修改预约状态                           | employee           |
| `cancelMyReservation`   | 取消本人预约                           | guest              |

> 具体以当前 resolver 实现为准；若有变动，请同步更新此表。

---

## 🌐 前端环境变量（Frontend）

在 `frontend/.env`（或运行前导出）设置：

```env
VITE_GRAPHQL_ENDPOINT=http://localhost:3002/graphql
VITE_AUTH_BASE_URL=http://localhost:3001
```

---

## 🧭 前端角色与导航体验（v2 UX）

| 用户类型 | 登录方式                | 能力/入口                                        |
| -------- | ----------------------- | ------------------------------------------------ |
| Guest    | email 或 phone 至少一个 | 查看 & 管理个人预约（My Reservations）、创建预约 |
| Employee | username + password     | 管理全部预约、更新状态                           |

菜单动态：

- Guest：`My Reservations`，新建等操作。
- Employee：`Admin Reservations`（预约管理页）。

---

## 🔗 Auth API（`frontend/src/api/auth.ts`）

Employee：

```http
POST /auth/register/employee { username, password }
→ { id, username, role: 'employee' }

POST /auth/login/employee { username, password }
→ { access_token }
```

Guest：

```http
POST /auth/register/guest { username, email?, phone? }
# username 必填；email / phone 至少一个
→ { id, role: 'guest', username, email?, phone? }

POST /auth/login/guest { email?, phone? }
# 至少一个
→ { access_token }
```

通用 introspection：

```http
POST /auth/introspect { token }
→ { active, sub, role, exp }
```

---

## 🧪 本地开发快速启动 (Local Dev Quick Start)

1. 启动 auth-service（默认端口 3001）。
2. 启动 reservation-service（确保端口 3002 或与前端配置匹配）。
3. 前端设置环境变量后运行：`npm run dev`（Vite 默认端口 5173）。
4. 使用 Employee 账户登录（需先通过 `/auth/register/employee` 或直接 DB 插入）。
5. 使用 Guest 账户登录，创建并查看个人预约。

---

## 🚀 后续潜在增强（Future Enhancements）

- 为 guest 的注册登录返回真实签名的 JWT（替换演示 token 逻辑）。
- Apollo 缓存：为状态更新添加乐观（optimistic）响应。
- 列表分页 & 高级过滤（日期范围 / 状态 / 关键词等）。
- Guest 账号的密码可选设置/重置流程。
- 登录接口限流（Rate Limiting）。

---

## 📁 额外建议（非原文新增）

若后续继续扩展，建议：

- 抽离统一的状态枚举与显示映射（前后端共享）。
- 引入 E2E 测试（Playwright / Cypress）验证多角色主流程。
- 增加错误码（Error Codes）与前端友好提示映射。

---

## ❓ 常见问题 (FAQ)

**Q: 为什么要用 introspection 而不是直接在服务里验证 JWT？**  
A: 统一由 auth-service 处理可集中管理密钥轮换、黑名单、扩展字段（如邮箱、电话）并可加缓存层。

**Q: 可以直接切换到 Azure Cosmos DB 吗？**  
A: 可以，只需提供对应的 Mongo API 连接串到 `COSMOS_MONGO_URI`，并移除本地 Mongo 容器。

**Q: 单元测试中的 Mongoose mock 无法满足更复杂聚合？**  
A: 可针对复杂查询引入 in-memory-mongodb（如 `mongodb-memory-server`）或扩展自定义 mock。

---

## 📜 License

本示例未显式声明开源协议；若要在生产中使用，请根据公司政策补充 LICENSE，并审查安全/合规项。

---

### 原文参考 (English Snapshot)

若需对照原始英文，可查看 Git 历史中的 `README.txt`（已在此提交中重命名为 Markdown 版本）。

---

如需英文版或增补更多章节（部署、CI/CD、监控、日志规范等），欢迎提出需求。祝开发顺利！
