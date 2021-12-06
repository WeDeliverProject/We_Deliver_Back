import Router from "@koa/router";
import * as menu from "./menu";

const router = new Router();

// 메뉴 조회
router.get("/:restaurantId", ...menu.menuList);

// 추가 메뉴 조회
router.get("/plus/:menuId", ...menu.plusMenuList);


export default router;
