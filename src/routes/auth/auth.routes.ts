import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { loginSchema, refreshTokenSchema, registerSchema } from "@/db/schemas/auth.schema";
import jwtAuthMiddleware from "@/middlewares/jwt.middleware";

const tags = ["Authentication"];

export const register = createRoute({
  path: "/auth/register",
  method: "post",
  request: {
    body: jsonContentRequired(
      registerSchema,
      "The registration data",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({
        id: z.number(),
        username: z.string(),
        email: z.string(),
      }),
      "The created user",
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Email or username already exists",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(registerSchema),
      "Validation error(s)",
    ),
  },
});

export const login = createRoute({
  path: "/auth/login",
  method: "post",
  request: {
    body: jsonContentRequired(
      loginSchema,
      "The login credentials",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
      }),
      "The access and refresh tokens",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Invalid credentials",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(loginSchema),
      "Validation error(s)",
    ),
  },
});

export const refreshToken = createRoute({
  path: "/auth/refresh-token",
  method: "post",
  request: {
    body: jsonContentRequired(
      refreshTokenSchema,
      "The refresh token data",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        accessToken: z.string(),
      }),
      "The new access token",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Invalid or expired refresh token",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(refreshTokenSchema),
      "Validation error(s)",
    ),
  },
});

export const logout = createRoute({
  path: "/auth/logout",
  method: "post",
  middlewares: [jwtAuthMiddleware],
  request: {
    body: jsonContentRequired(
      refreshTokenSchema,
      "The refresh token to revoke",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "User logged out",
    },
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Invalid or expired refresh token",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(refreshTokenSchema),
      "Validation error(s)",
    ),
  },
});

export type RegisterRoute = typeof register;
export type LoginRoute = typeof login;
export type RefreshTokenRoute = typeof refreshToken;
export type LogoutRoute = typeof logout;
