Hilton Reservation — packaged scaffold

Notes:
- This package uses a local MongoDB container in docker-compose as a development stand-in for Azure Cosmos DB (MongoDB API).
- To use real Azure Cosmos DB, set COSMOS_MONGO_URI to your Cosmos connection string (see backend/.env.example) and remove or ignore the local mongo service.
- The backend GraphQL inputs have been strictly typed using @nestjs/graphql + class-validator.
- Unit test examples include usage of jest-mock-extended to mock Mongoose models; further refinement may be required to run tests locally.


Changelog v2:
- Added schema.gql example
- Improved unit tests to mock Mongoose model methods
- Adjusted backend Dockerfile for dev run

Auth & Environment (Reservation Service):
- Set JWT_SECRET in reservation-service/.env for token verification (default dev-secret used if unset; do not use in production).
- Example reservation-service/.env:
	COSMOS_MONGO_URI=mongodb://localhost:27017/hilton_reservations
	JWT_SECRET=change_me_dev
	CORS_ORIGINS=http://localhost:5173

Introspection Mode (Auth-Service Integration):
- Instead of local jwt.verify, reservation-service can call auth-service /auth/introspect.
- Add to reservation-service/.env:
	AUTH_INTROSPECTION_URL=http://localhost:5000/auth/introspect
	INTROSPECTION_CACHE_TTL_MS=30000
- Flow:
	1) Extract Bearer token
	2) POST { token } to introspection URL
	3) If active=true -> attach { sub, role } as user
	4) Guard checks role only (no signature parsing locally)
- Endpoint contract (auth-service): POST /auth/introspect { token } -> { active: boolean, sub?, role?, username?, exp?, iat? }

GraphQL Auth Usage:
- Provide Authorization: Bearer <jwt> header. Token payload should include { sub: <userId>, role: 'guest' | 'employee' }.
- Queries:
	* myReservations: guest or employee.
	* reservations (with filters): employee only.
	* createReservation: guest or employee (auto associates userId from token).
	* updateReservation / setReservationStatus: employee only.

Frontend Environment Variables:
- Create frontend/.env (or export before running Vite):
  VITE_GRAPHQL_ENDPOINT=http://localhost:3002/graphql
  VITE_AUTH_BASE_URL=http://localhost:3001

Role-Based Frontend Flow (v2 UX):
- Guest login: email only (demo), sees Reservations list and Register page.
- Employee login: email + password, redirected to Admin page (status management) only.
- Menu items adjust dynamically: Guest => Reservations, Register. Employee => Admin.

Auth API Integration (frontend/src/api/auth.ts):
- POST /auth/login { username, password } -> { access_token }
- POST /auth/register { username, password, role } -> { id, username, role }
- POST /auth/introspect { token } -> { active, sub, role, exp }

Local Dev Quick Start:
1. Start auth-service (default port 3001).
2. Start reservation-service (configure to port 3002 if needed).
3. Set env vars for frontend and run `npm run dev` (Vite default 5173).
4. Login as employee (must pre-create user via /auth/register or direct DB insert) to access Admin page.
5. Login as guest to create and view own reservations.

Future Enhancements:
- Replace guest demo token with real JWT issuance on registration.
- Add optimistic Apollo cache updates for status changes.
- Add pagination and advanced filtering on reservation list.
