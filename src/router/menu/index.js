import Router from "@koa/router";
import * as menu from "./menu";

const router = new Router();

// 생성
router.get("/:restaurantId", ...menu.menuList);


export default router;
