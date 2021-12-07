import jwt from "jsonwebtoken";
import Boom from "@hapi/boom";
import dotenv from "dotenv";

dotenv.config()

const jwtSecret = process.env.JWT_SECRET;

export const generateToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSecret,
      {
        expiresIn: "2h",
      },
      (error, token) => {
        if (error) reject(error);
        resolve(token);
      }
    );
  });
};

export const decodeToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (error, decoded) => {
      if (error) reject(error)
      resolve(decoded);
    });
  });
}

const jwtMd = async (ctx, next) => {
  const access_token = ctx.headers.authorization;
  
  try {
    const decoded = await decodeToken(access_token);
    const {_id, nickname} = decoded;

    if (Date.now() / 1000 - decoded.iat > 60 * 60 * 24) {
      // 하루가 지나면 갱신해준다.
      const freshToken = await generateToken({ _id, nickname });
      ctx.state.body = {
        ...ctx.state.body,
        access_token: freshToken,
      };
    }
    ctx.state.user = decoded;
  } catch (err) {
    if (!access_token) {
      throw Boom.unauthorized("토큰이 존재하지 않습니다.");
    } else {
      throw Boom.unauthorized("유효하지 않는 토큰입니다.");
    }
  }

  await next();
};

export default jwtMd;
