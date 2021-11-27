import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";
import fs from "fs";
import path from "path";

export const createOrderMd = async (ctx, next) => {
  
  const { conn } = ctx.state;
  const { menu } = ctx.request.body;

  // menu
  // [
  //    {
  //        "menu_id" : 1
  //        "count" : 2
  //    }
  // ]



  await next();
};

