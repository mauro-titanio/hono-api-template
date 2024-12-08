import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Shared Password Schema
const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .max(255)
  .describe("The password of the user");

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(128)
    .describe("The email of the user"),
  password: passwordSchema,
});

// Register Schema
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(128, "First name cannot be longer than 128 characters")
      .describe("The first name of the user"),
    surname: z
      .string()
      .min(1, "Surname is required")
      .max(128, "Surname cannot be longer than 128 characters")
      .describe("The surname of the user"),
    email: z
      .string()
      .email("Invalid email address")
      .max(128)
      .describe("The email of the user"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required")
    .describe("The refresh token to be validated"),
});

// Users Table
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  surname: text("surname").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// User Tokens Table
export const userTokens = sqliteTable("user_tokens", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  token: text("token").notNull(),
  revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

// Zod Schemas for Users
export const selectUserSchema = createSelectSchema(users);

export const insertUserSchema = createInsertSchema(users, {
  firstName: schema => schema.firstName.min(1).max(128),
  surname: schema => schema.surname.min(1).max(128),
  email: schema => schema.email.email("Invalid email address").max(128),
  password: schema => schema.password.min(1).max(255),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const patchUserSchema = insertUserSchema.partial();

// Zod Schemas for User Tokens
export const selectUserTokenSchema = createSelectSchema(userTokens);

export const insertUserTokenSchema = createInsertSchema(userTokens, {
  token: schema => schema.token.min(1).max(255),
  expiresAt: schema => schema.expiresAt,
  revoked: schema => schema.revoked,
})
  .required({
    userId: true,
  })
  .omit({
    id: true,
    createdAt: true,
  });
