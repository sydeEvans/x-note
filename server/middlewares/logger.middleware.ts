import { Context } from "../types/index.ts";
import { Next } from "https://deno.land/x/oak@v12.6.1/middleware.ts";

const loggerMiddleware = async (ctx: Context, next: Next) => {
  await next();
  const reqTime = ctx.response.headers.get("X-Response-Time");
  const reqId = ctx.response.headers.get("X-Response-Id");
  const status = ctx.response.status;
  console.log(
    `${reqId} ${ctx.request.method} ${ctx.request.url} - ${reqTime} status: ${status}`,
  );
};

export { loggerMiddleware };
