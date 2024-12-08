import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { users, userTokens } from "@/db/schemas/auth.schema";
import { createToken, validateToken } from "@/lib/jwt";
import { passwordHash, passwordVerify } from "@/lib/password";

import type {
  LoginRoute,
  LogoutRoute,
  RefreshTokenRoute,
  RegisterRoute,
} from "./auth.routes";

const ACCESS_EXPIRATION = 900; // 15 minutes
const REFRESH_EXPIRATION = 2592000; // 30 days

// Register
export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const data = c.req.valid("json");

  const existingUser = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, data.email);
    },
  });

  if (existingUser) {
    return c.json(
      { message: "Email already exists" },
      HttpStatusCodes.CONFLICT,
    );
  }

  const hashedPassword = await passwordHash(data.password);
  const [user] = await db.insert(users)
    .values({
      firstName: data.firstName,
      surname: data.surname,
      email: data.email,
      password: hashedPassword,
    })
    .returning();

  return c.json(
    { id: user.id, firstName: user.firstName, surname: user.surname, email: user.email },
    HttpStatusCodes.CREATED,
  );
};

// Login
export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where(fields) {
      return eq(fields.email, email);
    },
  });

  if (!user || !(await passwordVerify(password, user.password))) {
    return c.json(
      { message: "Invalid email or password" },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  const accessToken = await createToken({ sub: user.id }, ACCESS_EXPIRATION);
  const refreshToken = await createToken({ sub: user.id }, REFRESH_EXPIRATION);

  await db.insert(userTokens).values({
    token: refreshToken,
    userId: user.id,
    revoked: false,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRATION * 1000),
  });

  return c.json({ accessToken, refreshToken }, HttpStatusCodes.OK);
};

export const refreshToken: AppRouteHandler<RefreshTokenRoute> = async (c) => {
  const { refreshToken } = c.req.valid("json");

  try {
    const decoded = await validateToken(refreshToken);

    const tokenRecord = await db.query.userTokens.findFirst({
      where(fields) {
        return eq(fields.token, refreshToken);
      },
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      // Add a check for revoked tokens and expiration
      return c.json(
        { message: "Invalid or expired refresh token" },
        HttpStatusCodes.UNAUTHORIZED,
      );
    }

    const newAccessToken = await createToken({ sub: decoded.sub }, ACCESS_EXPIRATION);
    return c.json({ accessToken: newAccessToken }, HttpStatusCodes.OK);
  }
  catch {
    return c.json(
      { message: "Invalid or expired refresh token" },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }
};

// Logout
export const logout: AppRouteHandler<LogoutRoute> = async (c) => {
  const { refreshToken } = c.req.valid("json");

  const tokenRecord = await db.query.userTokens.findFirst({
    where(fields) {
      return eq(fields.token, refreshToken);
    },
  });

  if (!tokenRecord || tokenRecord.revoked) {
    // Ensure revoked tokens are treated as invalid
    return c.json(
      { message: "Invalid or expired refresh token" },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  await db.update(userTokens).set({ revoked: true }).where(eq(userTokens.id, tokenRecord.id));
  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
