import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import * as middlewares from "./middlewares/middlewares.ts";
import { router } from "./routers/routes.ts";
import * as path from "https://deno.land/std@0.204.0/path/mod.ts";
import { bold, yellow } from "https://deno.land/std@0.200.0/fmt/colors.ts";
import "./config/config.ts";

const port = 8000;
const app = new Application();
const staticFileRoot = Deno.env.get("ENV") === "dev"
  ? path.resolve(Deno.cwd(), "../client/dist")
  : path.resolve(Deno.cwd(), "./dist");

app.use(oakCors());

app.use(middlewares.loggerMiddleware);
app.use(middlewares.errorMiddleware);
app.use(middlewares.timingMiddleware);
app.use(middlewares.requestIdMiddleware);

app.use(middlewares.historyfallback(staticFileRoot));

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (context, next) => {
  try {
    await context.send({
      root: staticFileRoot,
      index: "index.html",
      maxage: 60 * 60 * 24 * 30 * 1000,
    });
  } catch {
    await next();
  }
});

// Log when we start listening for requests
app.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(`
ENV: ${Deno.env.get("ENV")}
${bold("Start listening on ")}${yellow(`${hostname}:${port}`)}
${bold(`Using HTTP server: ${yellow(serverType)}`)}
  `);
});

await app.listen({ port });
