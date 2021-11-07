import Router from "@koa/router";
import members from "./members";
import orders from "./orders";
import restaurants from "./restaurants";
import reviews from "./reviews";
import menu from "./menu";

const router = new Router({
  prefix: "/api/v1",
});

router.use("/members", members.routes());
router.use("/orders", orders.routes());
router.use("/restaurants", restaurants.routes());
router.use("/reviews", reviews.routes());
router.use("/menu", menu.routes());

export default router;
