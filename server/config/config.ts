import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";

await load({
  export: true,
  defaultsPath: ".env.local",
});
