import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";

export const saveReviewMd = async (ctx, next) => {
  const { collection } = ctx.state;
  const { restaurantId, starRating, contents, memberId } = ctx.request.body;

  const reviewId = UUID();

  await collection.insertOne({
    _id: reviewId,
    restaurantId: restaurantId,
    starRating: starRating,
    contents: contents,
    memberId: memberId,
  });

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
  
  console.log(row);

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
  ctx.state.collection = collection;

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
