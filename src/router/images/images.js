import Boom from "@hapi/boom";
import { v4 as UUID } from "uuid";
import * as CommonMd from "../middlewares";
import fs from "fs";
import path from "path";

export const uploadImageManyMd = async(ctx, next) => {
  const images = ctx.request.files.image === undefined ? [] : ctx.request.files.image;

  for(let i=0; i < images.length; i++) {
    const appDir = path.dirname(images[i].path);
    const imageName = images[i].name;
    await fs.renameSync(images[i].path, `${appDir}/${imageName}`);
  }

  await next();
}

export const uploadImageOneMd = async(ctx, next) => {
  const images = ctx.request.files.image === undefined ? [] : ctx.request.files.image;

  const appDir = path.dirname(images.path);
  const imageName = images.name;
  await fs.renameSync(images.path, `${appDir}/${imageName}`);

  await next();
}

export const uploadMany = [
  CommonMd.createConnectionMd,
  uploadImageManyMd,
  CommonMd.responseMd
]

export const uploadOne = [
  CommonMd.createConnectionMd,
  uploadImageOneMd,
  CommonMd.responseMd
]