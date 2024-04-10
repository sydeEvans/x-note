import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const common = new Router();

common.get("/", (ctx) => {
    ctx.response.body = JSON.stringify({ message: "Hello" });
});

common.all("/proxy", async (c) => {
    const url = new URL(c.request.url.toString());
    const target = url.searchParams.get("url");

    if (!target) {
        c.response.body = "No target url";
        c.response.status = 400;
        return;
    }

    const options = {
        method: c.request.method,
    };

    const res = await fetch(target, options);
    const data = await res.text();

    c.response.body = data;
});

export { common };
