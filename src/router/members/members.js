import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";

export const getDataFromBodyMd = async (ctx, next) => {
  const { userId, password, nickname } = ctx.request.body;

  ctx.state.reqBody = {
    userId,
    password,
    nickname,
  };

  await next();
};

export const validateDataMd = async (ctx, next) => {
  const { userId, password, nickname } = ctx.request.body;

  if (!userId || !password || !nickname) {
    throw Boom.badRequest("field is not fulfiled");
  }

  await next();
};

export const isDuplicatedEmailMd = async (ctx, next) => {
  const { userId } = ctx.state.reqBody;
  const { conn } = ctx.state;

  const rows = await conn.query("SELECT * FROM member WHERE user_id = ?", [
    userId,
  ]);

  if (rows.length > 0) {
    throw Boom.badRequest("duplicated email");
  }

  await next();
};

export const saveMemberMd = async (ctx, next) => {
  const { userId, password, nickname } = ctx.request.body;
  const { conn } = ctx.state;

  // eslint-disable-next-line max-len
  await conn.query(
    "INSERT INTO member(id, user_id, nickname, password) \
    VALUES (?, ?, ?, password(?))",
    [UUID(), userId, nickname, password]
  );

  await next();
};

export const queryMemberMdById = async (ctx, next) => {
  const { userId } = ctx.state.reqBody;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT id, user_id, nickname FROM member WHERE user_id = ?",
    [userId]
  );

  if (rows.length === 0) {
    throw Boom.badRequest("Bad Request")
  }

  await next();
};

export const loginValidateDataMd = async (ctx, next) => {
  const { userId, password } = ctx.request.body;

  if (!userId || !password) {
    throw Boom.badRequest("field is not fulfiled");
  }

  await next();
};

export const loginMd = async (ctx, next) => {

  const { conn } = ctx.state;
  const { userId, password } = ctx.request.body;

  const row = await conn.query(
    "SELECT id, nickname FROM member WHERE user_id =? AND password = password(?)",
    [userId, password]
  )

  if (row.length === 0) {
    throw Boom.badRequest("로그인 실패");
  }
  
  const token = await generateToken({...row[0]})

  ctx.state.body={
    accessToken: token
  }

  await next();
}

export const create = [
  CommonMd.createConnectionMd,
  getDataFromBodyMd,
  validateDataMd,
  isDuplicatedEmailMd,
  saveMemberMd,
  queryMemberMdById,
  CommonMd.responseMd,
];

export const login = [
  CommonMd.createConnectionMd,
  loginValidateDataMd,
  loginMd,
  CommonMd.responseMd,
];
