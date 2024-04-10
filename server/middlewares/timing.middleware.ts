import { Context } from "../types/index.ts";
import { Next } from "https://deno.land/x/oak@v12.6.1/middleware.ts";
const timingMiddleware = async (ctx: Context, next: Next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
};

export { timingMiddleware };
