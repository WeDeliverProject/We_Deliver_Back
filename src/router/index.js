import Router from "@koa/router";
import members from "./members";

const router = new Router({
  prefix: "/api/v1",
});

router.use("/members", members.routes());

export default router;
