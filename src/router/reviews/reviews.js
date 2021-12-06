import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";


export const saveReviewMd = async(ctx, next) => {

  const { collection } = ctx.state;
  const { restaurantId, starRating, contents, memberId } = ctx.request.body;

  const reviewId = UUID();

  await collection.insertOne(
    {_id: reviewId, restaurantId: restaurantId, starRating: starRating, contents: contents, memberId: memberId}
  )
  
  await next();
}

export const listByRestaurantMd = async (ctx, next) => {

  const { collection } = ctx.state;
  const { restaurantId } = ctx.params;

  const rows = await collection.find(
    {_id: restaurantId}, {projection:{reviews: 1, _id:0}}
  ).toArray();

  ctx.state.body = { 
    count: rows.length,
    ...rows[0]
  }

  await next();
}

export const createCollectionMd = async (ctx, next) => {
  const {conn} = ctx.state;
  const collection = conn.collection('restaurant');
  ctx.state.collection = collection;

  await next();
}

// eslint-disable-next-line max-len
export const create = [
  CommonMd.createConnectionMd,
  createCollectionMd,
  saveReviewMd,
  CommonMd.responseMd,
];

export const listByRestaurant = [
  CommonMd.createConnectionMd,
  createCollectionMd,
  listByRestaurantMd,
  CommonMd.responseMd
]
