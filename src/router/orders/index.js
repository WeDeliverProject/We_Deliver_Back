import Router from "@koa/router";
import * as orders from "./orders";

const router = new Router();

// 생성
router.post("/", ...orders.create);

export default router;
