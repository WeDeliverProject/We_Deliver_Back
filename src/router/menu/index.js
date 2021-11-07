import Router from "@koa/router";
import * as menu from "./menu";

const router = new Router();

// 생성
router.post("/register", ...menu.create);


export default router;
