import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";
import fs from "fs";
import path from "path";

export const getDataFromBodyMd = async (ctx, next) => {
  const { email, password, name, type, mobile, birthDate } = ctx.request.body;

  ctx.state.reqBody = {
    email,
    password,
    name,
    type,
    mobile,
    birthDate,
  };

  await next();
};

export const validateDataMd = async (ctx, next) => {
  const { email, password, name, type, mobile, birthDate } = ctx.state.reqBody;

  if (!email || !password || !type || !name || !mobile || !birthDate) {
    throw Boom.badRequest("field is not fulfiled");
  }

  await next();
};

export const validateUpdateDataMd = async (ctx, next) => {
  // const {
  //   // eslint-disable-next-line no-unused-vars
  //   name,
  //   password,
  //   mobile,
  // } = ctx.request.body;

  // // if (!name || !password || !mobile) {
  // //   throw Boom.badRequest("field is not fulfiled");
  // // }

  await next();
};

export const isDuplicatedEmailMd = async (ctx, next) => {
  const { email } = ctx.state.reqBody;
  const { files } = ctx.request;
  const { conn } = ctx.state;

  console.log(files);

  const rows = await conn.query("SELECT * FROM tb_member WHERE email = ?", [
    email,
  ]);

  if (rows.length > 0) {
    throw Boom.badRequest("duplicated email");
  }

  await next();
};

export const saveMemberMd = async (ctx, next) => {
  const { email, password, name, type, mobile, birthDate } = ctx.state.reqBody;
  const { conn } = ctx.state;

  // eslint-disable-next-line max-len
  await conn.query(
    "INSERT INTO tb_member(id, email, name, password, type, mobile, birthDate) \
    VALUES (?, ?, ?, password(?), ?, ?, ?)",
    [UUID(), email, name, password, type, mobile, birthDate]
  );

  await next();
};

export const queryMemberMdByEmail = async (ctx, next) => {
  const { email } = ctx.state.reqBody;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT id, email, name, type, mobile, createdAt FROM tb_member WHERE email = ?",
    [email]
  );

  ctx.state.body = rows[0];

  await next();
};

export const queryMemberMdById = async (ctx, next) => {
  const { id } = ctx.params;
  const { conn } = ctx.state;

  const sql =
    "SELECT id, email, name, type, mobile, createdAt, birthdate, department, grade, studentID \
    FROM tb_member WHERE id = ?";
  const rows = await conn.query(sql, [id]);

  ctx.state.body = {
    ...rows[0],
  };

  await next();
};

export const removeMemberMd = async (ctx, next) => {
  const { conn } = ctx.state;
  const { id } = ctx.params;

  await conn.query("DELETE FROM tb_member WHERE id = ?", [id]);
  await next();
};

export const readMemberIdMd = async (ctx, next) => {
  const { id } = ctx.params;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT id, email, name, type, mobile, createdAt, studentID, grade, department, birthDate, profileImg \
    FROM tb_member WHERE id = ?",
    [id]
  );

  ctx.state.body = {
    ...rows[0],
  };

  await next();
};

export const readMemberEmailMd = async (ctx, next) => {
  const { email } = ctx.params;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT id, email, name, type, mobile, createdAt FROM tb_member WHERE id = ?",
    [email]
  );

  ctx.state.body = {
    ...rows[0],
  };

  await next();
};

export const readStudentLoginMd = async (ctx, next) => {
  const { email, password } = ctx.request.body;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT id, name, email, mobile, profileImg, birthDate, department,grade, studentID \
    FROM tb_member WHERE email = ? AND password = password(?)",
    [email, password]
  );

  if (rows.length === 0) {
    throw Boom.badRequest("wrong id password");
  }

  ctx.state.body = rows[0];

  await next();
};

export const readProfessorLoginMd = async (ctx, next) => {
  const { email, password } = ctx.request.body;
  const { conn } = ctx.state;

  console.log(email);
  console.log(password);

  const rows = await conn.query(
    "SELECT id, name, email, mobile, profileImg, birthDate, department \
    FROM tb_member WHERE email = ? AND password = password(?)",
    [email, password]
  );

  if (rows.length === 0) {
    throw Boom.badRequest("wrong id password");
  }

  ctx.state.body = rows[0];

  await next();
};

export const jwtGenerateMd = async (ctx, next) => {
  const { id, name } = ctx.state.body;
  const payload = { id, name };
  let token = null;

  try {
    token = await generateToken(payload);
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.state.body = {
    ...ctx.state.body,
    access_token: token,
  };

  await next();
};

export const updateStudentMd = async (ctx, next) => {
  const { id } = ctx.params;
  const { conn } = ctx.state;

  let { name, password, grade, department, studentID, mobile } =
    ctx.request.body;

  const profileImg =
    ctx.request.files === undefined ? null : ctx.request.files.profileImg;

  console.log(ctx.request.files);

  const imageName = profileImg ? profileImg.name : null;

  const row = await conn.query(
    "SELECT name, grade, department, studentID, profileImg, mobile FROM tb_member WHERE id = ?",
    [id]
  );

  name = name === undefined ? row[0].name : name;
  grade = grade === undefined ? row[0].grade : grade;
  department = department === undefined ? row[0].department : department;
  studentID = studentID === undefined ? row[0].studentID : studentID;
  mobile = mobile === undefined ? row[0].mobile : mobile;

  if (password === undefined) {
    await conn.query(
      "UPDATE tb_member SET name = ?, grade = ?, department = ?, studentID = ?, profileImg = ?, mobile = ?  WHERE id = ?",
      [name, grade, department, studentID, imageName, mobile, id]
    );
  } else {
    const sql =
      // eslint-disable-next-line max-len
      "UPDATE tb_member SET name = ?, password = password(?), grade = ?, department = ?, studentID = ?, profileImg = ?, mobile = ?  WHERE id = ?";

    await conn.query(sql, [
      name,
      password,
      grade,
      department,
      studentID,
      imageName,
      mobile,
      id,
    ]);
  }

  await next();
};

export const updateProfessorMd = async (ctx, next) => {
  const { id } = ctx.params;
  const { conn } = ctx.state;


  let { name, password, department, professorID, mobile } = ctx.request.body;

  const profileImg =
    ctx.request.files === undefined ? null : ctx.request.files.profileImg;
  let imageName = null;
  if (profileImg!= null) {
    const appDir = path.dirname(profileImg.path);
    imageName = `${Date.now()}_${profileImg.name}`;
    await fs.renameSync(profileImg.path, `${appDir}/${imageName}`);
  }
  const row = await conn.query(
    "SELECT name, grade, department, studentID, profileImg, mobile FROM tb_member WHERE id = ?",
    [id]
  );

  name = name === undefined ? row[0].name : name;
  department = department === undefined ? row[0].department : department;
  professorID = professorID === undefined ? row[0].professorID : professorID;
  mobile = mobile === undefined ? row[0].mobile : mobile;

  if (password === undefined) {
    await conn.query(
      "UPDATE tb_member SET name = ?, department = ?, studentID = ?, profileImg = ?, mobile = ?  WHERE id = ?",
      [name, department, professorID, imageName, mobile, id]
    );
  } else {
    const sql =
      // eslint-disable-next-line max-len
      "UPDATE tb_member SET name = ?, password = password(?), department = ?, studentID = ?, profileImg = ?, mobile = ?  WHERE id = ?";

    await conn.query(sql, [
      name,
      password,
      department,
      professorID,
      imageName,
      mobile,
      id,
    ]);
  }

  await next();
};

export const readMemberAllMd = async (ctx, next) => {
  const { skip, limit } = ctx.state.query;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT id, email, name, type, mobile, createdAt FROM tb_member LIMIT ?, ?",
    [skip, limit]
  );

  ctx.state.body = {
    results: rows,
  };

  await next();
};

export const readMemberAllCountMd = async (ctx, next) => {
  const { conn } = ctx.state;

  const rows = await conn.query("SELECT COUNT(*) AS count  FROM tb_member");

  ctx.state.body = {
    ...ctx.state.body,
    total: rows[0].count,
  };

  await next();
};

export const checkMd = async (ctx, next) => {
  const { user } = ctx.state;

  if (user === undefined) {
    ctx.status = 403;
    throw Boom.badRequest("forbidden");
  }

  ctx.state.body = user;

  await next();
};

export const getTokenMd = async (ctx, next) => {
  const access_token = ctx.headers.authorization.split(" ")[1];;

  if (!access_token) Boom.badRequest("invalid token");
  console.log(access_token);
  
  const decoded = await decodeToken(access_token);
  if (Date.now() / 1000 - decoded.iat > 60 * 10) {
    throw Boom.badRequest("timeout");
  }
  console.log(decoded);
  ctx.state.email = decoded.email;

  await next();
}

export const changePasswordMd = async (ctx, next) => {
  const { conn } = ctx.state;

  const { password } = ctx.request.body;
  
  const email = ctx.state.email;
  await conn.query("UPDATE tb_member SET password = password(?) where email = ?", [password, email]);

  ctx.state.body = {
    success: true,
  };
  await next();
}

// eslint-disable-next-line max-len
export const create = [
  CommonMd.createConnectionMd,
  getDataFromBodyMd,
  validateDataMd,
  isDuplicatedEmailMd,
  saveMemberMd,
  queryMemberMdByEmail,
  CommonMd.responseMd,
];

// skip, limit (skip: 시작위치, limit: 가져올 데이터 수)
// ex) skip=0, limit=10 이면 0번째부터 10개를 가져와라
// skip=10, limit=10 10번째부터 10개를 가져와라
export const readAll = [
  CommonMd.createConnectionMd,
  CommonMd.validataListParamMd,
  readMemberAllMd,
  readMemberAllCountMd,
  CommonMd.responseMd,
];

export const readId = [
  CommonMd.createConnectionMd,
  CommonMd.validateIdParamMd,
  readMemberIdMd,
  CommonMd.responseMd,
];

export const readEmail = [
  CommonMd.createConnectionMd,
  CommonMd.validateIdParamMd,
  readMemberEmailMd,
  CommonMd.responseMd,
];

export const updateStudent = [
  CommonMd.createConnectionMd,
  CommonMd.validateIdParamMd,
  validateUpdateDataMd,
  updateStudentMd,
  queryMemberMdById,
  CommonMd.responseMd,
];

export const updateProfessor = [
  CommonMd.createConnectionMd,
  CommonMd.validateIdParamMd,
  validateUpdateDataMd,
  updateProfessorMd,
  queryMemberMdById,
  CommonMd.responseMd,
];

export const remove = [
  CommonMd.createConnectionMd,
  CommonMd.validateIdParamMd,
  removeMemberMd,
  CommonMd.responseMd,
];

export const studentLogin = [
  CommonMd.createConnectionMd,
  readStudentLoginMd,
  jwtGenerateMd,
  CommonMd.responseMd,
];

export const professorLogin = [
  CommonMd.createConnectionMd,
  readProfessorLoginMd,
  jwtGenerateMd,
  CommonMd.responseMd,
];

export const check = [
  CommonMd.createConnectionMd,
  checkMd,
  CommonMd.responseMd,
];

export const changePassword = [
  CommonMd.createConnectionMd,
  getTokenMd,
  changePasswordMd,
  CommonMd.responseMd,
]