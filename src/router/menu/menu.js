import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";

export const menuListMd = async (ctx, next) => {
  const { restaurantId } = ctx.params;
  const { collection } = ctx.state;

  const rows = await collection.find(
    {_id : Number(restaurantId)},{projection:{"menu":1, _id:0}}
  ).toArray();

  ctx.state.body= {
    count: rows.length,
    results: rows[0].menu
  }
  await next();
};

export const plusMenuListMd = async (ctx, next) => {

  const { menuId } = ctx.params;
  const { collection } = ctx.state;

  console.log(menuId)
  const rows = await collection.find(
    {"menu.id": Number(menuId)}, {projection:{"menu.plus_menu": 1, _id:0}}
  ).toArray();

  ctx.state.body = {
    count: rows.length,
    results: rows[0].menu[0].plus_menu
  }
  
  await next();
}

export const createCollectionMd = async (ctx, next) => {
  const { conn } = ctx.state;
  const collection = conn.collection('restaurant');
  ctx.state.collection = collection;

  await next();
}

export const menuList = [
  CommonMd.createConnectionMd,
  createCollectionMd,
  menuListMd,
  CommonMd.responseMd,
];

export const plusMenuList = [
  CommonMd.createConnectionMd,
  createCollectionMd,
  plusMenuListMd,
  CommonMd.responseMd
]