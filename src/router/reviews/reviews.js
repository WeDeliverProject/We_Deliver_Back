import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import fs from "fs";
import path from "path";


export const saveReviewMd = async (ctx, next) => {
  const { collection, order } = ctx.state;
  const { restaurantId, star_rating, content, nickname, orderId, menu } = ctx.request.body;

  const reviewId = UUID();

  const image = ctx.request.files.image === undefined ? [] : ctx.request.files.image;

  const appDir = path.dirname(image.path);
  const imageName = image.name;
  await fs.renameSync(image.path, `${appDir}/${imageName}`);

  const body = {
    _id: reviewId,
    star_rating: Number(star_rating),
    content: content,
    nickname: nickname,
    img: imageName,
    menu: menu,
  };

  await collection.updateOne(
    {
      _id: Number(restaurantId),
    },
    {
      $push: {
        reviews: body,
      },
    }
  );

  await order.updateOne(
    {
      _id: orderId,
    },
    {
      $set: {
        review: 1
      }
    }
  )

  await next();
};

export const listByRestaurantMd = async (ctx, next) => {
  const { collection } = ctx.state;
  const { restaurantId } = ctx.params;

  const rows = await collection
    .find({ _id: Number(restaurantId) }, { projection: { reviews: 1, _id: 0 } })
    .toArray();

  let star = [0, 0, 0, 0, 0];
  let sum = 0;
  for (let i = 0; i < rows[0].reviews.length; i++) {
    let idx = rows[0].reviews[i].star_rating;
    star[idx - 1] += 1;
    sum += idx;
  }

  let avg = 0;
  if (rows[0].reviews.length > 0) {
    const cnt = rows[0].reviews.length;
    avg = sum / cnt;
  }

  ctx.state.body = {
    count: rows[0].reviews.length,
    results: rows[0].reviews,
    starCount: star,
    starRating: avg,
  };

  await next();
};

export const listTodayReviewMd = async (ctx, next) => {

  const {collection} = ctx.state;
  const { cache } = ctx;
  const row = cache.get('todayReview');

  if(row === undefined) {
    const rows = await collection.find(
      {}, {projection: {reviews:1}}
    ).toArray();
    
    let reviews = [];
    for(let i=0; i<rows.length; i++) {
      const temp = reviews.concat(rows[i].reviews);
      reviews = temp;
    }

    if(reviews.length > 3) {
      let set = new Set();
      while(set.size < 3) {
        set.add(Math.floor(Math.random() * reviews));  
      }
      
      let body = [];
      set.forEach(function(value) {
        const temp = body.concat(reviews[value]);
        body = temp;
      })
      ctx.state.body = {
        count: body.length,
        results: body
      }
    } else {
      ctx.state.body = {
        count:reviews.length,
        results: reviews,
      }
    }

    cache.set('todayReview', ctx.state.body.results, 24 * 60 * 60)

  } else {
    ctx.state.body = {
      count: row.length,
      results: row,
    }
  }

  await next();
}

export const createCollectionMd = async (ctx, next) => {
  const { conn } = ctx.state;
  const collection = conn.collection("restaurant");
  const order = conn.collection("order");
  ctx.state.collection = collection;
  ctx.state.order = order;

  await next();
};

// eslint-disable-next-line max-len
export const create = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  saveReviewMd,
  CommonMd.responseMd,
];

export const listByRestaurant = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  listByRestaurantMd,
  CommonMd.responseMd,
];

export const listTodayReview = [
  CommonMd.createConnectionMd,
  createCollectionMd,
  listTodayReviewMd,
  CommonMd.responseMd
]
