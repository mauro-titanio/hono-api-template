# My API

A template for building fully documented and type-safe JSON APIs with Hono and OpenAPI.

## Included

- **Structured Logging**: Powered by [pino](https://getpino.io/) / [hono-pino](https://www.npmjs.com/package/hono-pino).
- **Documented and Type-Safe Routes**: Utilize [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi).
- **Interactive API Documentation**: Access with [scalar](https://scalar.com/#api-docs) / [@scalar/hono-api-reference](https://github.com/scalar/scalar/tree/main/packages/hono-api-reference).
- **Convenience Methods**: Reduce boilerplate with [stoker](https://www.npmjs.com/package/stoker).
- **Type-Safe Validation**: Powered by [zod](https://zod.dev/).
- **Single Source of Truth Database Schemas**: Integrated with [drizzle](https://orm.drizzle.team/docs/overview) and [drizzle-zod](https://orm.drizzle.team/docs/zod).
- **Testing Framework**: Easy testing with [vitest](https://vitest.dev/).
- **Code Quality**: Linting and formatting with [@antfu/eslint-config](https://github.com/antfu/eslint-config).

## Setup

Clone this repository and set up your environment:

Create the `.env` file:

```sh
cp .env.example .env
```

Install dependencies:

```sh
npm install
```

Initialize the database and push the schema:

```sh
npx drizzle-kit push
```

Run the development server:

```sh
npm run dev
```

Lint the project:

```sh
npm run lint
```

Run tests:

```sh
npm test
```

## Code Tour

- **Base Hono App**: Exported from [app.ts](./src/app.ts). The local development server uses [@hono/node-server](https://hono.dev/docs/getting-started/nodejs), defined in [index.ts](./src/index.ts).
- **Environment Variables**: Managed in [env.ts](./src/env.ts). The app ensures all required environment variables are set before starting.
- **Route Groups**: Example route group can be found in [src/routes/tasks/](./src/routes/tasks/):
  - Router: [tasks.index.ts](./src/routes/tasks/tasks.index.ts)
  - Routes: [tasks.routes.ts](./src/routes/tasks/tasks.routes.ts)
  - Handlers: [tasks.handlers.ts](./src/routes/tasks/tasks.handlers.ts)
  - Tests: [tasks.test.ts](./src/routes/tasks/tasks.test.ts)

## Endpoints

| Path                     | Description              |
| ------------------------ | ------------------------ |
| POST /auth/register      | Register a new user      |
| POST /auth/login         | Authenticate a user      |
| POST /auth/refresh-token | Refresh access token     |
| POST /auth/logout        | Log out a user           |
| GET /doc                 | Open API Specification   |
| GET /reference           | Scalar API Documentation |
| GET /tasks               | List all tasks           |
| POST /tasks              | Create a task            |
| GET /tasks/{id}          | Get one task by ID       |
| PATCH /tasks/{id}        | Patch one task by ID     |
| DELETE /tasks/{id}       | Delete one task by ID    |

## References

- **OpenAPI**:
  - [What is Open API?](https://swagger.io/docs/specification/v3_0/about/)
- **Hono**:
  - [Official Documentation](https://hono.dev/)
  - [Zod OpenAPI Example](https://hono.dev/examples/zod-openapi)
  - [Testing Guide](https://hono.dev/docs/guides/testing)
- **Scalar Documentation**:
  - [Themes and Layout](https://github.com/scalar/scalar/blob/main/documentation/themes.md)
  - [Configuration Guide](https://github.com/scalar/scalar/blob/main/documentation/configuration.md)
- **Drizzle ORM**:
  - [Overview](https://orm.drizzle.team/docs/overview)
  - [Drizzle Zod](https://orm.drizzle.team/docs/zod)

---

Build type-safe APIs faster with this starter template!
