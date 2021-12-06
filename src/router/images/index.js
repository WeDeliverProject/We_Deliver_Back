import Router from "@koa/router";
import * as images from "./images";

const router = new Router();

router.post("/many", ...images.uploadMany);
router.post("/one", ...images.uploadOne);

export default router;
