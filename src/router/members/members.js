import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../middlewares/jwtMd";
import crypto from 'crypto';

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

export const isDuplicatedUserIdMd = async (ctx, next) => {
  const { userId } = ctx.state.reqBody;
  const { collection } = ctx.state;

  const rows = await collection.find({user_id: userId}).toArray();

  if (rows.length > 0) {
    throw Boom.badRequest("duplicated id");
  }

  ctx.state.collection = collection;

  await next();
};

export const saveMemberMd = async (ctx, next) => {
  const { userId, password, nickname } = ctx.request.body;
  const { collection } = ctx.state;

  const id = UUID();

  await collection.insertOne(
    {_id : id , user_id : userId, nickname : nickname, password: hash(password)}
  );

  ctx.state.id = id;

  await next();
};

export const queryMemberMdById = async (ctx, next) => {
  const { collection, id } = ctx.state;

  const rows = await collection.find(
    {_id : id},  {projection:{password: 0}}
  ).toArray();

  if (rows.length === 0) {
    throw Boom.badRequest("Bad Request")
  }

  ctx.state.body = rows[0];

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

  const { collection } = ctx.state;
  const { userId, password } = ctx.request.body;

  const row = await collection.find(
    {user_id: userId, password: hash(password)}, {projection:{nickname : 1}}
  ).toArray();

  if (row.length === 0) {
    throw Boom.badRequest("로그인 실패");
  }

  const token = await generateToken({...row[0]})

  ctx.state.body={
    accessToken: token
  }

  await next();
}

export const createCollectionMd = async (ctx, next) => {

  const {conn} = ctx.state;
  const collection = conn.collection('member');
  ctx.state.collection = collection;

  await next();
}

const hash = (password) => {
  return crypto.createHash('sha512').update(password).digest('base64');
}

export const create = [
  CommonMd.createConnectionMd,
  createCollectionMd,
  getDataFromBodyMd,
  validateDataMd,
  isDuplicatedUserIdMd,
  saveMemberMd,
  queryMemberMdById,
  CommonMd.responseMd,
];

export const login = [
  CommonMd.createConnectionMd,
  createCollectionMd,
  loginValidateDataMd,
  loginMd,
  CommonMd.responseMd,
];
