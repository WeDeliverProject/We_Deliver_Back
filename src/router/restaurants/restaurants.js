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

export const readAll = [
  CommonMd.createConnectionMd,
  readAllMd,
  CommonMd.responseMd
]
