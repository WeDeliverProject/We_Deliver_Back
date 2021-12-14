import Router from "@koa/router";
import * as orders from "./orders";

const router = new Router();

router.post("/list", ...orders.createList);

router.post("/joint", ...orders.createJoint);

router.post("/delete", ...orders.deleteMenu);

router.get("/joint", ...orders.readAllJoint);

router.get("/", ...orders.readOrder);

router.post("/", ...orders.create);

router.post("/plus", ...orders.plus);

router.post("/minus", ...orders.minus);


export default router;
