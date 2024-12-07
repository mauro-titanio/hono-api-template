import env from "@/env";
import { createRouter } from "@/lib/create-app";
import jwtAuthMiddleware from "@/middlewares/jwt.middleware";

import * as handlers from "./tasks.handlers";
import * as routes from "./tasks.routes";

const router = createRouter();

// Conditionally use the middleware only if not in test environment
if (env.NODE_ENV !== "test") {
  router.use(jwtAuthMiddleware);
}

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.remove, handlers.remove);

export default router;
