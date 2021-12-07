import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";

export const readInfoMd = async(ctx, next) => {
  const { collection } = ctx.state;
  const { restaurantId } = ctx.params;
  
  const rows = await collection.find(
    {_id: restaurantId}, {projection: {information:1, _id:0}}
  ).toArray();


  ctx.state.body = {
    ...rows[0].infromation,
  }

  await next();
}

export const createCollectionMd = async (ctx, next) => {
  const {conn} = ctx.state;
  const collection = conn.collection('restaurant');
  ctx.state.collection = collection;

  await next();
}

export const readInfo = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  readInfoMd,
  CommonMd.responseMd
]
