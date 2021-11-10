import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import { generateToken, decodeToken } from "../../middlewares/jwtMd";
import fs from "fs";
import path from "path";

export const getDataFromBodyMd = async (ctx, next) => {
  const { email, password, name, type, mobile, birthDate } = ctx.request.body;

  ctx.state.reqBody = {
    email,
    password,
    name,
    type,
    mobile,
    birthDate,
  };

  await next();
};
