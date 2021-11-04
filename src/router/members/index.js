import Router from "@koa/router";
import * as members from "./members";

const router = new Router();

// 생성
router.post("/register", ...members.create);

// 리스트 조회
router.get("/", ...members.readAll);

// 교수님 로그인
router.post("/professor/login", ...members.professorLogin);

// 학생 로그인
router.post("/student/login", ...members.studentLogin);

// 토큰 확인
router.get("/check", ...members.check);

// 상세 조회
router.get("/:id", ...members.readId);

// 상세 조회2
router.get("/:email", ...members.readEmail);

// 교수님 정보 수정
router.put("/professor/:id", ...members.updateProfessor);

// 학생 정보 수정
router.put("/student/:id", ...members.updateStudent);


// 삭제
router.delete("/:id", ...members.remove);

router.put("/changePw", ...members.changePassword);

export default router;
