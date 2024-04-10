import { send } from "https://deno.land/x/oak@v12.6.1/send.ts";
import { Context } from "../types/index.ts";
import { Next } from "https://deno.land/x/oak@v12.6.1/middleware.ts";

export const historyfallback = (root: string) => {
  return async (ctx: Context, next: Next) => {
    await next();

    if (ctx.response.status === 404) {
      await send(ctx, "/", {
        maxage: 0,
        root,
        index: "index.html",
      });
    }
  };
};
