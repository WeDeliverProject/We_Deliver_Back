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
  const restaurant = conn.collection('restaurant');
  const order = conn.collection('order');
  ctx.state.collection = collection;
  ctx.state.restaurant = restaurant;
  ctx.state.order = order;

  await next();
}

const hash = (password) => {
  return crypto.createHash('sha512').update(password).digest('base64');
}


export const createDataMd = async (ctx, next) => {

  const { restaurant, order, conn } = ctx.state;

  await conn.dropCollection("restaurant");
  await conn.dropCollection("order");

  await restaurant.insertMany([{
        "_id": 2,
        "name": "구어돈",
        "img": "구어돈.jpg",
        "category": "korean",
        "lng": 37.62728367472624,
        "lat": 127.07833462839024,
        "min_order_amount": 10000,
        "delivery_fee": 1500,
        "menu": [
            {
                "id": 1,
                "name": "돈삼겹고기만",
                "price": 7000,
                "img": "돈삼겹고기만.jpg",
                "category": "인기 메뉴",
                "addition":[],
            },
            {
                "id": 2,
                "name": "돈삼겹곱빼기",
                "price": 9000,
                "img": "돈삼겹곱빼기.jpg",
                "category": "인기 메뉴",
                "addition":[],
            },
            {
                "id": 3,
                "name": "도시락세트",
                "price": 8000,
                "img": "도시락세트.jpg",
                "category": "인기 메뉴",
                "addition":[],
            },
            {
                "id": 4,
                "name": "돈 양념삼겹",
                "price": 10500,
                "img": "돈양념삼겹.jpg",
                "category": "인기 메뉴",
                "addition":[],
            }
        ],
        "reviews": [],
    },
    {
      "_id": 1,
      "name": "한양식당",
      "img": "한양식당.jpg",
      "category": "korean",
      "lng": 37.62741336143698,
      "lat": 127.07976212222471,
      "min_order_amount": 15000,
      "delivery_fee": 1500,
      "menu": [
          {
              "id": 1,
              "name": "제육볶음",
              "price": 7000,
              "img": "제육.jpg",
              "category": "인기 메뉴",
              "addition":[],
          },
          {
              "id": 2,
              "name": "오징어볶음",
              "price": 9000,
              "img": "오징어.jpg",
              "category": "인기 메뉴",
              "addition":[],
          },
          {
              "id": 3,
              "name": "김치찌개",
              "price": 7000,
              "img": "김치찌개.jpg",
              "category": "인기 메뉴",
              "addition":[],
          }
      ],
      "reviews": [],
  }]);

  await order.insertMany([
    {
      "_id": 1,
      "restaurant_id": 1,
      "price": 1500,
      "joint": 0
  },
  {
        "_id": 2,
        "restaurant_id": 1,
        "price": 2000,
        "joint": 0
    },{
      "_id": 3,
      "restaurant_id": 2,
      "price": 2000,
      "joint": 1
    }])

  await next();
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
  createDataMd,
  CommonMd.responseMd,
];
