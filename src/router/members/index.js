import Router from "@koa/router";
import * as members from "./members";

const router = new Router();

router.post("/register", ...members.create);

router.post("/login", ...members.login);

export default router;
