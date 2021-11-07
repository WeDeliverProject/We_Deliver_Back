import Router from "@koa/router";
import * as reviews from "./reviews";

const router = new Router();

// 생성
router.post("/register", ...reviews.create);

export default router;
