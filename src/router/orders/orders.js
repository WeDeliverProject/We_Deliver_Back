import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import fs from "fs";
import path from "path";

export const createOrderMd = async (ctx, next) => {
  
  const { collection } = ctx.state;


  await next();
};

export const createJointMd = async (ctx, next) => {
  const { collection } = ctx.state;
  const { restaurantId, price, name } = ctx.request.body;

  const query = { 'name': name } 

  const option = { upsert: true };

  const newValue = {
    $set: {
      order: [
        {
          "id": UUID(),
          "price": price,
          "joint": true,
        }
      ]
    }
  }

  const result = await collection.updateOne(
    query, newValue, option
  )
  
  console.log(result);
  
  await next();

}

export const createCollectionMd = async (ctx, next) => {
  const {conn} = ctx.state;
  const collection = conn.collection('order');
  ctx.state.collection = collection;

  await next();
}

export const readAllJointMd = async (ctx, next) => {

  const { collection } = ctx.state;

  const rows = await collection.aggregate([
    {
      $match: {
        "joint": 1
      }
    },
    {
      $lookup: {
        from: "restaurant",
        localField: "restaurant_id",
        foreignField: "_id",
        as: "restaurantInfo"
      },
    },
    { $unwind: "$restaurantInfo" },
    {
      $project: {
        _id: 1,
        price: 1,
        name: "$restaurantInfo.name",
        lng: "$restaurantInfo.lng",
        lat: "$restaurantInfo.lat",
        min_order_amount: "$restaurantInfo.min_order_amount",
        delivery_fee: "$restaurantInfo.delivery_fee",
      }
    }
  ]).toArray();

  ctx.state.body = {
    count: rows.length,
    results: rows,
  }

  await next();
}

export const create = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  createOrderMd,
  CommonMd.responseMd
]

export const createJoint = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  createJointMd,
  CommonMd.responseMd
]

export const readAllJoint= [
  CommonMd.createConnectionMd,
  createCollectionMd,
  readAllJointMd,
  CommonMd.responseMd
]

