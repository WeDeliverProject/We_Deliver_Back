import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";

export const readAllMd = async (ctx, next) => {
  const { category } = ctx.params;
  const { collection } = ctx.state;

  const rows = await collection.find(
    {category: category},{projection:{menu:0,orders:0,lng:0,lat:0}}
  ).toArray();

  for(let i=0; i<rows.length; i++) {
    
    const reviews = rows[i].reviews;
    let sum = 0;
    for(let j = 0; j<reviews.length; j++) {
      sum += reviews[j].star_rating;
    }
    let star = sum / reviews.length;
    rows[i].reviewCount = reviews.length;
    rows[i].star = star;
    delete rows[i].reviews;
  }

  ctx.state.body = {
    count : rows.length,
    results: rows
  };

  await next();
};

export const restaurantOneMd = async (ctx, next) => {

  const { collection } = ctx.state;
  const { restaurantId } = ctx.params;

  const rows = await collection.find(
      {_id: Number(restaurantId)},{projection:{menu:0}}
    ).toArray();
  const reviews = rows[0].reviews;
  let sum = 0;
  for(let i = 0; i<reviews.length; i++) {
    sum += reviews[i].star_rating;
  }
  let star = sum / reviews.length;
  
  rows[0].reviewCount = reviews.length;
  rows[0].star = star;

  delete rows[0].reviews

  ctx.state.body = {
    ...rows[0]
  }

  await next();
}

export const createCollectionMd = async (ctx, next) => {
  const {conn} = ctx.state;
  const collection = conn.collection('restaurant');
  const order = conn.collection('order');
  ctx.state.collection = collection;
  ctx.state.order = order;

  await next();
}

export const createDataMd = async (ctx, next) => {

  const { collection, order, conn } = ctx.state;

  await conn.dropCollection("restaurant");
  await conn.dropCollection("order");

  await collection.insertMany([{
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

export const readAll = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  readAllMd,
  CommonMd.responseMd
]

export const readOne = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  restaurantOneMd,
  CommonMd.responseMd
]

export const dummy = [
  CommonMd.createConnectionMd,
  createCollectionMd,
  createDataMd,
  CommonMd.responseMd  
]