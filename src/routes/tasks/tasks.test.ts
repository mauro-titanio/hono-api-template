/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { ZodIssueCode } from "zod";

import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp from "@/lib/create-app";

import router from "./tasks.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

// Utility function to add a delay between operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const client = testClient(createApp().route("/", router));

describe("tasks routes", () => {
  beforeAll(() => {
    execSync("npx drizzle-kit push");
  });
  afterAll(async () => {
    fs.rmSync("test.db", { force: true }); // Clean up the test database
  });

  let taskId: number | null = null;

  it("post /tasks validates the body when creating", async () => {
    await delay(50); // Prevent SQLite locking issues
    // @ts-expect-error
    const response = await client.tasks.$post({
      json: {
        done: false,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });

  const name = "Learn vitest";

  it("post /tasks creates a task", async () => {
    await delay(50); // Prevent SQLite locking issues
    // @ts-expect-error
    const response = await client.tasks.$post({
      json: {
        name,
        done: false,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      taskId = json.id; // Save the created task ID
      expect(json.name).toBe(name);
      expect(json.done).toBe(false);
    }
  });

  it("get /tasks lists all tasks", async () => {
    await delay(50); // Prevent SQLite locking issues
    // @ts-expect-error
    const response = await client.tasks.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      // @ts-expect-error
      expectTypeOf(json).toBeArray();
      expect(json.length).toBeGreaterThan(0);
      if (!taskId) {
        taskId = json[0].id; // Dynamically assign taskId if not set
      }
    }
  });

  it("get /tasks/{id} validates the id param", async () => {
    await delay(50); // Prevent SQLite locking issues
    // @ts-expect-error
    const response = await client.tasks[":id"].$get({
      param: {
        id: "wat",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

  it("get /tasks/{id} returns 404 when task not found", async () => {
    await delay(50); // Prevent SQLite locking issues
    // @ts-expect-error
    const response = await client.tasks[":id"].$get({
      param: {
        id: 999,
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    }
  });

  it("get /tasks/{id} gets a single task", async () => {
    await delay(50); // Prevent SQLite locking issues
    // @ts-expect-error
    const response = await client.tasks[":id"].$get({
      param: {
        id: taskId!,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe(name);
      expect(json.done).toBe(false);
    }
  });

  it("patch /tasks/{id} validates the body when updating", async () => {
    await delay(50); // Prevent SQLite locking issues
    // @ts-expect-error
    const response = await client.tasks[":id"].$patch({
      param: {
        id: taskId!,
      },
      json: {
        name: "",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].code).toBe(ZodIssueCode.too_small);
    }
  });

  it("patch /tasks/{id} updates a single property of a task", async () => {
    await delay(50); // Prevent SQLite locking issues
    // @ts-expect-error
    const response = await client.tasks[":id"].$patch({
      param: {
        id: taskId!,
      },
      json: {
        done: true,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.done).toBe(true);
    }
  });

  it("delete /tasks/{id} removes a task", async () => {
    await delay(50); // Prevent SQLite locking issues
    // @ts-expect-error
    const response = await client.tasks[":id"].$delete({
      param: {
        id: taskId!,
      },
    });
    expect(response.status).toBe(204);
  });
});
