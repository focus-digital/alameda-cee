# AGENTS.md: Fastify & Prisma Backend

## Stack

- Prisma: ORM
- Fastify: API
- SQlite: initial database
- Vitest: testing
- tanstack/ai: AI/LLM chat
- Resend: Email service

## Project Overview & Structure

<pre>
prisma/ → database schema and settings
  schema.prisma → your database schema lives here.  
  seed.ts → seeds your database with data, pattern is to use services. 
src/ → backend logic
  server.ts → entry point for server
  api/ → the API main folder
    docs/ → swagger API documentation schemas and artifacts
    plugins/ → middleware  
    routes/ → routes files for each top level route
  domain → types and enums
  repo/ → database interactions for each table through prisma, returns domain types
  service/ → application business logic, use one or more repos
  util/ → utility functions
</pre>

## Development Environment & Setup

In the `backend` folder:
1. run `cp .env-example .env` to duplicate local env variables, update as applicable
2. run `yarn` to install all dependencies
3. run `yarn db:reset` to run initial migration and the seeder
4. run `yarn api` to start the db
5. Open http://localhost:3000/docs to see and try API with swagger / OpenAPI UI

## Code Style & Conventions

TypeScript:
* The project is strictly TypeScript. Ensure all new files have proper typings.
* Follow the existing structure and conventions.

Database schema updates
* Whenever a database schema is updated, make sure to update relevant domain type files, swagger documentation and schemas (see src/api/docs), and any uses in business logic code.

Fastify Best Practices:
* Prefer using Fastify's built-in schema validation (with `$ref` if using shared schemas) for routes to ensure type safety and generate documentation automatically.
* Register plugins and routes using Fastify's `register` and `autoload` mechanisms to maintain a clean structure (see src/server.ts).
* When generating new API endpoints / routes, make sure to include swagger / openapi documentation. Follow the existing pattern and document both success and error response schemas.

Prisma Usage:
* Avoid writing raw SQL queries. Use Prisma Client's methods (`findMany`, `create`, `update`, etc.) for all data operations.
* Do not hardcode secrets or connection strings in the code; use environment variables via `.env` file.

Email Service:
* The `EmailService` class (`src/service/emailService.ts`) uses Resend for sending emails.
* Requires `EMAIL_SERVICE_API_TOKEN` environment variable to be configured.
* The `AiService` uses `EmailService` for the `sendMessageToCustomerSupport` tool to send customer support requests via email.
