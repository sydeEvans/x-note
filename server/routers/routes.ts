import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

import { alist } from "./alist.ts";
import { common } from "./common.ts";

const router = new Router();

router.use("/api/common", common.routes(), common.allowedMethods());
router.use("/api/alist", alist.routes(), alist.allowedMethods());

export { router };
