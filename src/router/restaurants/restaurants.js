import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";

export const readAllMd = async (ctx, next) => {
  const { category } = ctx.params;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT * FROM restaurant r WHERE category = ?",[category]
  );

  const reviews = await conn.query(
    "SELECT * FROM review"
  );


  for(let i=0; i<rows.length; i++) {
    const r = reviews.filter((review) => {
      if(review.restaurant_id === rows[i].id) return true;
    });
    let sum = 0;
    for(let j = 0; j<r.length; j++) {
      console.log(r[j].star_rating);
      sum += r[j].star_rating;
    }
    let star = sum / r.length;
    
    rows[i].reviewCount = r.length;
    rows[i].star = star;
  }

  ctx.state.body = {
    count : rows.length,
    results: rows
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

export const loginMd = async (ctx, next) => {
  const { userId, password } = ctx.request.body;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT id, user_id, password, nickname\
    FROM member WHERE user_id = ? AND password = password(?)",
    [userId, password]
  );

  if (rows.length === 0) {
    throw Boom.badRequest("wrong id password");
  }

  ctx.state.body = rows[0];

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
  const access_token = ctx.headers.authorization.split(" ")[1];

  if (!access_token) Boom.badRequest("invalid token");
  console.log(access_token);

  const decoded = await decodeToken(access_token);
  if (Date.now() / 1000 - decoded.iat > 60 * 10) {
    throw Boom.badRequest("timeout");
  }
  console.log(decoded);
  ctx.state.email = decoded.email;

  await next();
};

export const changePasswordMd = async (ctx, next) => {
  const { conn } = ctx.state;

  const { password } = ctx.request.body;

  const email = ctx.state.email;
  await conn.query(
    "UPDATE tb_member SET password = password(?) where email = ?",
    [password, email]
  );

  ctx.state.body = {
    success: true,
  };
  await next();
};


export const Login = [
  CommonMd.createConnectionMd,
  loginMd,
  CommonMd.responseMd,
];

export const readAll = [
  CommonMd.createConnectionMd,
  readAllMd,
  CommonMd.responseMd
]
