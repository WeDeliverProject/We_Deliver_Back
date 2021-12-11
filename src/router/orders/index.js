import Router from "@koa/router";
import * as orders from "./orders";

const router = new Router();

// 생성
router.post("/", ...orders.create);

router.post("/joint", ...orders.createJoint);

router.get("/joint", ...orders.readAllJoint);


export default router;
