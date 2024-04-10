import {
  isHttpError,
  Next,
  Status,
} from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Context } from "../types/index.ts";

const errorMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    let message = err.message;
    const status = err.status || err.statusCode || Status.InternalServerError;
    const env = Deno.env.get("ENV");
    /**
     * considering all unhandled errors as internal server error,
     * do not want to share internal server errors to
     * end user in non "development" mode
     */
    if (!isHttpError(err)) {
      message = env === "dev" || env === "development"
        ? message
        : "Internal Server Error";
    }

    if (env === "dev" || env === "development") {
      console.log(err);
    }

    ctx.response.status = status;
    ctx.response.body = { status, message };
  }
};

export { errorMiddleware };
