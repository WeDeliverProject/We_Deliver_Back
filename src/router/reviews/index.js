import Router from "@koa/router";
import * as reviews from "./reviews";

const router = new Router();

// ์์ฑ
router.post("/", ...reviews.create);

// ์กฐํ
router.get("/:restaurantId", ...reviews.listByRestaurant);

router.get("/today/o", ...reviews.listTodayReview);

export default router;
