import Router from "@koa/router";
import * as informations from "./informations";

const router = new Router();

router.get("/:restaurantId", ...informations.readInfo);

export default router;
