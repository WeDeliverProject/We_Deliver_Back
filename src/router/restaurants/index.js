import Router from "@koa/router";
import * as restaurants from "./restaurants";

const router = new Router();

// 리스트 조회
router.get("/listAll/:category", ...restaurants.readAll);

// 상세 조회
router.get("/:restaurantId", ...restaurants.readOne);


export default router;
