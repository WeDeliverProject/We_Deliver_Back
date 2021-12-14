import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import { menuListMd } from "../menu/menu";
import * as CommonMd from "../middlewares";

export const createOrderMd = async (ctx, next) => {
  
  const { collection, user } = ctx.state;
  const { name, count, price, restaurantId, menuId, addition} = ctx.request.body;

  const rows = await collection.find(
    {
      "member_id": user._id,
      "isAccept": 0,
    }
  ).toArray();

  const menu = await collection.find(
    {
      "menu.id": menuId,
      "isAccept": 0
    },
    {
      projection: {
        "menu": 1,
      }
    }
  ).toArray();

  if (rows.length > 0 && menu.length === 0) {
    await collection.updateOne(
      {
        "member_id": user._id,
        "isAccept": 0
      }, 
      {
        $push: {
          "menu": 
            {
              "id": menuId,
              "name": name,
              "count": count,
              "price": price,
              "addition": addition,
            }
        }
      }
    )
  } else if (menu.length > 0) { 
    
    const r = menu[0].menu.filter((item) => {
      if(item.id === menuId) return true;
    })

    console.log(r)
    r[0]['count'] = r[0].count+1;
    console.log(r)
    await collection.updateOne(
      {
        "menu.id": menuId,
        "isAccept": 0
      },
      {
        $pull: {
          "menu":
            {
              "id": menuId,
            }
        }
      }
    )
    
    await collection.updateOne(
      {
        "member_id": user._id,
        "isAccept": 0
      },
      {
        $push: {
          "menu": r[0]
        }
      }
    )

  } else {
    await collection.insertOne({
      _id: UUID(),
      "member_id": user._id,
      "restaurant_id": Number(restaurantId),
      "isAccept": 0,
      "joint" : 0,
      "menu": [
        {
          "id": menuId,
          "name": name,
          "count": count,
          "price": price,
        }
      ]
    })
  }

  await next();
};

export const createJointMd = async (ctx, next) => {
  const { collection, user } = ctx.state;
  const { price } = ctx.request.body;

  const query = { 
    'member_id': user._id,
    'isAccept': 0
  }

  const newValue = {
    $set: {
      "joint": 1,
      "isAccept": 1,
      "price": price,
    }
  }

  const result = await collection.updateOne(
    query, newValue
  )
  
  await next();
}

export const readAllJointMd = async (ctx, next) => {

  const { collection } = ctx.state;

  const rows = await collection.aggregate([
    {
      $match: {
        "joint": 1
      }
    },
    {
      $lookup: {
        from: "restaurant",
        localField: "restaurant_id",
        foreignField: "_id",
        as: "restaurantInfo"
      },
    },
    { $unwind: "$restaurantInfo" },
    {
      $project: {
        _id: 1,
        price: 1,
        name: "$restaurantInfo.name",
        img: "$restaurantInfo.img",
        lng: "$restaurantInfo.lng",
        lat: "$restaurantInfo.lat",
        min_order_amount: "$restaurantInfo.min_order_amount",
        delivery_fee: "$restaurantInfo.delivery_fee",
      }
    }
  ]).toArray();

  ctx.state.body = {
    count: rows.length,
    results: rows,
  }

  await next();
}

export const readOrderMd = async (ctx, next) => {

  const { collection, user } = ctx.state;

  const rows = await collection.find(
    {
      "member_id": user._id,
      "isAccept": 0
    },
    {
      projection: {
        "menu": 1
      }
    }
  ).toArray();

  if (rows.length > 0) {
    ctx.state.body = {
      count: rows[0].menu.length,
      results: rows[0].menu
    }
  } else {
    ctx.state.body = {
      count: rows.length,
      results: rows
    }
  }

  await next();
}

export const deleteMenuMd = async (ctx, next) => {

  const { collection, user } = ctx.state;
  const { menuId } = ctx.request.body;

  await collection.updateOne(
    {
      "member_id": user._id,
      "isAccept": 0
    }, 
    {
      $pull: {
        "menu": 
          {
            "id": menuId,
          }
      }
    }) 
  await next();
}

export const createMd = async (ctx, next) => {

  const { collection, user } = ctx.state;
  const { price } = ctx.request.body;

  await collection.updateOne(
    {
      "member_id": user._id,
      "isAccept": 0
    },
    {
      $set: {
        "isAccept": 1,
        "price": price,
      }
    }
  )
  
  await next();
}

export const minusMd = async (ctx, next) => {

  const { collection, user } = ctx.state;
  const { menuId } = ctx.request.body;

  const menu = await collection.find(
    {
      "menu.id": menuId,
      "isAccept": 0
    },
    {
      projection: {
        "menu": 1,
      }
    }
  ).toArray();

  const r = menu[0].menu.filter((item) => {
    if(item.id === menuId) return true;
  })

  r[0]['count'] = r[0].count-1;
  if(r[0]['count'] === 0) {
    await collection.updateOne(
      {
        "menu.id": menuId,
        "isAccept": 0
      },
      {
        $pull: {
          "menu":
            {
              "id": menuId,
            }
        }
      }
    )
  } else {
    await collection.updateOne(
      {
        "menu.id": menuId,
        "isAccept": 0
      },
      {
        $pull: {
          "menu":
            {
              "id": menuId,
            }
        }
      }
    )
    
    await collection.updateOne(
      {
        "member_id": user._id,
        "isAccept": 0
      },
      {
        $push: {
          "menu": r[0]
        }
      }
    )
  }
  
  await next();
}

export const plusMd = async (ctx, next) => {

  const { collection, user } = ctx.state;
  const { menuId } = ctx.request.body;

  const menu = await collection.find(
    {
      "menu.id": menuId,
      "isAccept": 0
    },
    {
      projection: {
        "menu": 1,
      }
    }
  ).toArray();

  const r = menu[0].menu.filter((item) => {
    if(item.id === menuId) return true;
  })

  r[0]['count'] = r[0].count+1;
  await collection.updateOne(
    {
      "menu.id": menuId,
      "isAccept": 0
    },
    {
      $pull: {
        "menu":
          {
            "id": menuId,
          }
      }
    }
  )
  
  await collection.updateOne(
    {
      "member_id": user._id,
      "isAccept": 0
    },
    {
      $push: {
        "menu": r[0]
      }
    }
  )
  await next();
}

export const createCollectionMd = async (ctx, next) => {
  const {conn} = ctx.state;
  const collection = conn.collection('order');
  ctx.state.collection = collection;

  await next();
}

export const createList = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  createOrderMd,
  CommonMd.responseMd
]

export const createJoint = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  createJointMd,
  CommonMd.responseMd
]

export const readAllJoint= [
  CommonMd.createConnectionMd,
  createCollectionMd,
  readAllJointMd,
  CommonMd.responseMd
]

export const readOrder = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  readOrderMd,
  CommonMd.responseMd
]

export const deleteMenu = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  deleteMenuMd,
  CommonMd.responseMd
]

export const create = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  createMd,
  CommonMd.responseMd
]

export const plus = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  plusMd,
  CommonMd.responseMd
]

export const minus = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createCollectionMd,
  minusMd,
  CommonMd.responseMd
]