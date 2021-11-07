import Router from "@koa/router";
import * as members from "./members";

const router = new Router();

// 생성
router.post("/register", ...members.create);

// 회원 로그인
router.post("/login", ...members.Login);

export default router;
