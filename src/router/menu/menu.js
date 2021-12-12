import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";

// export const menuListMd = async (ctx, next) => {
//   const { restaurantId } = ctx.params;
//   const { collection } = ctx.state;

//   const rows = await collection.aggregate([
//     {
//       $match: {
//         "restaurant_id": Number(restaurantId)
//       }
//     },
//     {
//       $lookup: {
//         from: "restaurant",
//         localField: "restaurant_id",
//         foreignField: "_id",
//         as: "restaurantInfo"
//       },
//     },
//     { $unwind: "$restaurantInfo" },
//     {
//       $project: {
//         _id: 1,
//         name: 1,
//         price: 1,
//         img: 1,
//         category: 1
//       }
//     }
//   ]).toArray();

//   ctx.state.body= {
//     count: rows.length,
//     results: rows
//   }

//   await next();
// };

export const menuListMd = async (ctx, next) => {
  const { restaurantId } = ctx.params;
  const { collection } = ctx.state;

  const rows = await collection.find(
    {_id: Number(restaurantId)}, {projection:{menu:1}}
  ).toArray();

  ctx.state.body= {
    count: rows[0].menu.length,
    results: rows[0].menu
  }

  await next();
};

export const plusMenuListMd = async (ctx, next) => {
  const { menuId } = ctx.params;
  const { menu } = ctx.state;

  const rows = await menu.find(
    {"_id": Number(menuId)}, {projection:{"addition": 1, _id:1}}
  ).toArray();
  
  ctx.state.body = {
    count: rows[0].addition.length,
    results: rows[0].addition
  }
  
  await next();
}

export const createCollectionMd = async (ctx, next) => {
  const { conn } = ctx.state;
  const collection = conn.collection('restaurant');
  const menu = conn.collection('menu');

  ctx.state.collection = collection;
  ctx.state.menu = menu;

  await next();
}

export const menuList = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  menuListMd,
  CommonMd.responseMd,
];

export const plusMenuList = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  plusMenuListMd,
  CommonMd.responseMd
]