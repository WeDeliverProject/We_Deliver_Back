import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";

export const readInfoMd = async(ctx, next) => {
  const { conn } = ctx.state;
  const { restaurantId } = ctx.params;
  
  const row = await conn.query(
    "SELECT * FROM information WHERE restaurant_id = ?",
    [restaurantId]
  );

  ctx.state.body = {
    ...row[0],
  }

  await next();
}

export const readInfo = [
  CommonMd.createConnectionMd,
  readInfoMd,
  CommonMd.responseMd
]
