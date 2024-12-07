import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { createRouter } from "@/lib/create-app";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/",
      responses: {
        [HttpStatusCodes.PERMANENT_REDIRECT]: {
          description: "Redirect to /reference",
        },
      },
    }),
    (c) => {
      // Redirect to /reference
      return c.redirect("/reference", HttpStatusCodes.PERMANENT_REDIRECT);
    },
  );

export default router;
