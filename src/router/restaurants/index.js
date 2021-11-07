import Router from "@koa/router";
import * as restaurants from "./restaurants";

const router = new Router();

// 리스트 조회
router.get("/:category", ...restaurants.readAll);


export default router;
