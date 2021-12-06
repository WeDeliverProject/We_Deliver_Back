import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";

export const menuListMd = async (ctx, next) => {
  const { restaurantId } = ctx.params;
  const { collection } = ctx.state;

  const rows = await collection.find(
    {restaurantId : restaurantId}
  ).toArray();

  ctx.state.body= {
    count: rows.length,
    results: rows
  }
  await next();
};

export const plusMenuListMd = async (ctx, next) => {

  const { menuId } = ctx.params;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT * FROM plus_menu WHERE menu_id = ?",
    [menuId]
  )

  ctx.state.body = {
    count: rows.length,
    results: rows
  }
  
  await next();
}

export const createCollectionMd = async (ctx, next) => {
  const { conn } = ctx.state;
  const collection = conn.collection('menu');
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
  menuListMd,
  CommonMd.responseMd
]