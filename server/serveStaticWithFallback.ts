import { Next } from "https://deno.land/x/hono@v3.4.1/types.ts";
import { Context } from "https://deno.land/x/hono@v3.8.3/context.ts";
import { getFilePath } from "https://deno.land/x/hono@v3.8.3/utils/filepath.ts";
import { getMimeType } from "https://deno.land/x/hono@v3.8.3/utils/mime.ts";

const { open } = Deno;

export type ServeStaticOptions = {
  root?: string;
  path?: string;
  rewriteRequestPath?: (path: string) => string;
};

const DEFAULT_DOCUMENT = "index.html";

export const serveStaticWithFallback = (
  options: ServeStaticOptions = { root: "" },
) => {
  return async (c: Context, next: Next) => {
    // Do nothing if Response is already set
    if (c.finalized) {
      await next();
      return;
    }

    const url = new URL(c.req.url);
    const filename = options.path ?? decodeURI(url.pathname);
    let path = getFilePath({
      filename: options.rewriteRequestPath
        ? options.rewriteRequestPath(filename)
        : filename,
      root: options.root,
      defaultDocument: DEFAULT_DOCUMENT,
    });

    if (!path) return await next();

    path = `./${path}`;

    let file;

    try {
      file = await open(path);
    } catch (e) {
      console.warn(`${e}`);
    }

    if (file) {
      const mimeType = getMimeType(path);
      if (mimeType) {
        c.header("Content-Type", mimeType);
      }
      // Return Response object with stream
      return c.body(file.readable);
    } else {
      console.warn(`Static file: ${path} is not found`);
      await next();
      if (c.res.status === 404) {
        c.finalized = false;
        const defaultPath = `./${getFilePath({
          filename: "index.html",
          root: options.root,
          defaultDocument: DEFAULT_DOCUMENT,
        })!}`;
        file = await open(defaultPath);

        return c.body(file.readable, 200, {
          "Content-Type": "text/html; charset=utf-8",
        });
      }
    }
    return;
  };
};
