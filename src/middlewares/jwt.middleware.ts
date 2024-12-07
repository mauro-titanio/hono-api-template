import { jwt } from "hono/jwt";

import env from "@/env";

/**
 * Middleware for protecting routes with JWT authentication.
 */
const jwtAuthMiddleware = jwt({
  secret: env.JWT_SECRET,
});

export default jwtAuthMiddleware;
