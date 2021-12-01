import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";

export const menuListMd = async (ctx, next) => {
  const { restaurantId } = ctx.params;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT * FROM menu WHERE restaurant_id = ?",
    [restaurantId]
  )
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

export const menuList = [
  CommonMd.createConnectionMd,
  menuListMd,
  CommonMd.responseMd,
];

export const plusMenuList = [
  CommonMd.createConnectionMd,
  menuListMd,
  CommonMd.responseMd
]