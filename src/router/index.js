import Router from "@koa/router";
import members from "./members";
import orders from "./orders";
import restaurants from "./restaurants";
import reviews from "./reviews";
import menu from "./menu";
import informations from "./informations";
import images from "./images";
import { jwtMd } from "./middlewares";

const router = new Router({
  prefix: "/api/v1",
});

router.use("/members", members.routes());
router.use("/orders", orders.routes());
router.use("/restaurants", restaurants.routes());
router.use("/reviews", reviews.routes());
router.use("/menu", menu.routes());
router.use("/informations", informations.routes());
router.use("/images", images.routes());

export default router;
