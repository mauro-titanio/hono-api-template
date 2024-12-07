import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import env from "@/env";

import * as authSchema from "./schemas/auth.schema";
import * as taskSchema from "./schemas/task.schema";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client, {
  schema: {
    ...taskSchema,
    ...authSchema,
  },
});

export default db;
