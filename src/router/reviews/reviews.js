import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";
import fs from "fs";
import path from "path";


export const saveReviewMd = async(ctx, next) => {

  const { conn } = ctx.state;
  const { restaurantId, starRating, contents, memberId } = ctx.request.body;

  const images = ctx.request.files.image === undefined ? [] : ctx.request.files.image;

  const imageNames = [];
  for(let i=0; i < images.length; i++) {
    const appDir = path.dirname(images[i].path);
    const imageName = `${Date.now()}_${images[i].name}`;
    await fs.renameSync(images[i].path, `${appDir}/${imageName}`);
    imageNames.push(imageName);
  }

  const reviewId = UUID();

  await conn.query(
    "INSERT INTO review(id, restaurant_id, star_rating, contents, member_id) VALUES(?,?,?,?,?)"
    ,[reviewId,restaurantId, starRating, contents, memberId]
  )

  const tuples = imageNames.map((obj) => [obj, reviewId]);
  if(images.length > 0) {
    await conn.batch(
      "INSERT INTO image(imgName, review_id) VALUES(?,?)"
      ,tuples
    )
  }
  
  await next();
}

export const listByRestaurantMd = async (ctx, next) => {
  
  const { conn } = ctx.state;
  const { restaurantId } = ctx.params;

  const rows = await conn.query(
    "SELECT r.contents, m.user_id, r.star_rating, r.member_id, r.image  FROM review r \
    JOIN member m ON m.id = r.member_id \
    WHERE r.restaurant_id = ?",
    [restaurantId]
  )

  const orders = await conn.query(
    "SELECT o.id, o.member_id, o.created_at, om.menu_id \
    FROM mydb.order o \
    JOIN mydb.order_menu om ON om.order_id = o.id \
    where o.restaurant_id = ?"
    ,[restaurantId]
  )

  for(let i=0; i<rows.length; i++) {
    const o = orders.filter((order) => {
      if(order.member_id === rows[i].member_id) return true;
    });
    
    rows[i].orders = o;
  }

  ctx.state.body = { 
    count: rows.length,
    results : rows
  }

  await next();
}


// eslint-disable-next-line max-len
export const create = [
  CommonMd.createConnectionMd,
  saveReviewMd,
  CommonMd.responseMd,
];

export const listByRestaurant = [
  CommonMd.createConnectionMd,
  listByRestaurantMd,
  CommonMd.responseMd
]
