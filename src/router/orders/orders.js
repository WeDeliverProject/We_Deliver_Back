import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import fs from "fs";
import path from "path";

export const createOrderMd = async (ctx, next) => {
  
  const { conn } = ctx.state;
  const results = ctx.request.body;

  await next();
};

export const create = [
  CommonMd.jwtMd,
  CommonMd.createConnectionMd,
  createOrderMd,
  CommonMd.responseMd
]

