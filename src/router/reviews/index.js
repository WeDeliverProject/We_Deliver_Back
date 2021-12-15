import Router from "@koa/router";
import * as reviews from "./reviews";

const router = new Router();

// 생성
router.post("/", ...reviews.create);

// 조회
router.get("/:restaurantId", ...reviews.listByRestaurant);

router.get("/today/o", ...reviews.listTodayReview);

export default router;
