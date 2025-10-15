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
