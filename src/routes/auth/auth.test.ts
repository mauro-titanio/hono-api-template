/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import env from "@/env";
import createApp from "@/lib/create-app";

import router from "./auth.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

// Add a small delay utility to ensure SQLite operations are spaced out
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const client = testClient(createApp().route("/", router));

describe("auth routes", () => {
  beforeAll(async () => {
    // Ensure the database is set up before tests
    execSync("npx drizzle-kit push");
  });

  afterAll(async () => {
    // Clean up the test database after all tests are completed
    fs.rmSync("test.db", { force: true });
  });

  const validUser = () => ({
    firstName: "Test",
    surname: "User",
    email: `testuser_${Date.now()}@example.com`,
    password: "securePassword123",
    confirmPassword: "securePassword123",
  });

  let accessToken: string;
  let refreshToken: string;

  it("post /auth/register validates the body", async () => {
    const response = await client.auth.register.$post({
      // @ts-expect-error
      json: {
        email: "invalid-email",
        password: "",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("post /auth/register creates a user", async () => {
    await delay(50); // Prevent SQLITE_BUSY by adding delay

    const response = await client.auth.register.$post({
      json: validUser(),
    });
    expect(response.status).toBe(201);
    if (response.status === 201) {
      const json = await response.json();
      expect(json.firstName).toBeDefined();
      expect(json.surname).toBeDefined();
      expect(json.email).toBeDefined();
    }
  });

  it("post /auth/login authenticates a user", async () => {
    const user = validUser();
    await delay(50); // Ensure no conflicts with the database
    await client.auth.register.$post({ json: user });

    const response = await client.auth.login.$post({
      json: {
        email: user.email,
        password: user.password,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      accessToken = json.accessToken;
      refreshToken = json.refreshToken;
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
    }
  });

  it("post /auth/login returns 401 for invalid credentials", async () => {
    const response = await client.auth.login.$post({
      json: {
        email: "nonexistentuser@example.com",
        password: "wrongPassword",
      },
    });
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();
      expect(json.message).toBe("Invalid email or password");
    }
  });

  it("post /auth/refresh-token refreshes tokens", async () => {
    await delay(50); // Ensure no conflicts with refresh-token operation
    const refreshResponse = await client.auth["refresh-token"].$post({
      json: { refreshToken },
    });
    expect(refreshResponse.status).toBe(200);
    if (refreshResponse.status === 200) {
      const json = await refreshResponse.json();
      expect(json.accessToken).toBeDefined();
    }
  });

  it("post /auth/logout invalidates the refresh token", async () => {
    await delay(50); // Prevent SQLITE_BUSY by spacing out the operations

    // Log out with a valid refresh token
    const logoutResponse = await client.auth.logout.$post({
      json: { refreshToken },
    });
    expect(logoutResponse.status).toBe(204);

    // Attempt to use the same token for refreshing
    const refreshResponse = await client.auth["refresh-token"].$post({
      json: { refreshToken },
    });
    expect(refreshResponse.status).toBe(401);
    if (refreshResponse.status === 401) {
      const json = await refreshResponse.json();
      expect(json.message).toBe("Invalid or expired refresh token");
    }

    // Try to log out again with the revoked token
    const secondLogoutResponse = await client.auth.logout.$post({
      json: { refreshToken },
    });
    expect(secondLogoutResponse.status).toBe(401);
    if (secondLogoutResponse.status === 401) {
      const json = await secondLogoutResponse.json();
      expect(json.message).toBe("Invalid or expired refresh token");
    }
  });
});
