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

  await conn.query(
    "SELECT r.contents, m.user_id, r.star_rating,  FROM review r \
    JOIN image i ON r.id = i.review_id \
    JOIN member m ON m.id = r.member_id \
    WHERE r.restaurant_id = ?",
    [restaurantId]
  )


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
