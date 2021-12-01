import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";

export const readAllMd = async (ctx, next) => {
  const { category } = ctx.params;
  const { conn } = ctx.state;

  const rows = await conn.query(
    "SELECT * FROM restaurant r WHERE category = ?",[category]
  );

  const reviews = await conn.query(
    "SELECT * FROM review"
  );

  for(let i=0; i<rows.length; i++) {
    const r = reviews.filter((review) => {
      if(review.restaurant_id === rows[i].id) return true;
    });
    let sum = 0;
    for(let j = 0; j<r.length; j++) {
      console.log(r[j].star_rating);
      sum += r[j].star_rating;
    }
    let star = sum / r.length;
    
    rows[i].reviewCount = r.length;
    rows[i].star = star;
  }

  ctx.state.body = {
    count : rows.length,
    results: rows
  };

  await next();
};

export const restaurantOneMd = async (ctx, next) => {

  const { conn } = ctx.state;
  const { restaurantId } = ctx.params;

  const row = await conn.query(
    "SELECT r.name, r.delivery_cost, r.min_order_amount, r.payment, \
    SUM(re.star_rating)/COUNT(re.id) FROM restaurant r \
    JOIN review re ON re.restaurant_id = r.id \
    WHERE r.id = ?",
    [restaurantId]
  )
  
  ctx.state.body = {
    ...row[0]
  }

  await next();
}

export const readAll = [
  CommonMd.createConnectionMd,
  readAllMd,
  CommonMd.responseMd
]

export const readOne = [
  CommonMd.createConnectionMd,
  restaurantOneMd,
  CommonMd.responseMd
]