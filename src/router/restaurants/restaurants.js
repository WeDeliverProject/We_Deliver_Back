import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";

export const readAllMd = async (ctx, next) => {
  const { category } = ctx.params;
  const { collection } = ctx.state;

  const rows = await collection.find(
    {category: category},{projection:{menu:0}}
  ).toArray();

  for(let i=0; i<rows.length; i++) {
    
    const reviews = rows[i].reviews;
    let sum = 0;
    for(let j = 0; j<reviews.length; j++) {
      sum += reviews[j].star_rating;
    }
    let star = sum / reviews.length;
    
    rows[i].reviewCount = reviews.length;
    rows[i].star = star;
    delete rows[i].reviews;
  }

  ctx.state.body = {
    count : rows.length,
    results: rows
  };

  await next();
};

export const restaurantOneMd = async (ctx, next) => {

  const { collection } = ctx.state;
  const { restaurantId } = ctx.params;

  const rows = await collection.find(
      {_id: Number(restaurantId)},{projection:{menu:0}}
    ).toArray();

  const reviews = rows[0].reviews;
  let sum = 0;
  for(let i = 0; i<reviews.length; i++) {
    sum += reviews[i].star_rating;
  }
  let star = sum / reviews.length;
  
  rows[0].reviewCount = reviews.length;
  rows[0].star = star;

  delete rows[0].reviews

  ctx.state.body = {
    ...rows[0]
  }

  await next();
}

export const createCollectionMd = async (ctx, next) => {
  const {conn} = ctx.state;
  const collection = conn.collection('restaurant');
  ctx.state.collection = collection;

  await next();
}

export const readAll = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  readAllMd,
  CommonMd.responseMd
]

export const readOne = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  restaurantOneMd,
  CommonMd.responseMd
]