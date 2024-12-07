import type { JWTPayload } from "hono/utils/jwt/types";

import { sign, verify } from "hono/jwt";

import env from "@/env";

const JWT_SECRET = env.JWT_SECRET || "default-secret";

/**
 * Create a JWT Token.
 * @param payload The payload for the token.
 * @param expiresIn The expiration time in seconds.
 * @returns Signed JWT token.
 */
export async function createToken(payload: Record<string, any>, expiresIn: number): Promise<string> {
  return await sign({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresIn }, JWT_SECRET);
}

/**
 * Validate a JWT Token.
 * @param token The token to validate.
 * @returns Decoded payload if valid.
 * @throws Error if the token is invalid or expired.
 */
export async function validateToken(token: string): Promise<JWTPayload> {
  return await verify(token, JWT_SECRET);
}
