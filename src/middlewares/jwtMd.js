import jwt from "jsonwebtoken";
import config from "../config";

const jwtSecret = config.JWT_SECRET;

export const generateToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSecret,
      {
        expiresIn: "5m",
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
      if (error) reject(error);
      resolve(decoded);
    });
  });
}

const jwtMd = async (ctx, next) => {
  const access_token = ctx.headers.authorization;

  if (!access_token) return next();

  try {
    const decoded = await decodeToken(token);

    if (Date.now() / 1000 - decoded.iat > 60 * 60 * 24) {
      // 하루가 지나면 갱신해준다.
      const { id, name } = decoded;
      const freshToken = await generateToken({ id, name });
      ctx.state.body = {
        ...ctx.state.body,
        access_token: freshToken,
      };
    }
    ctx.state.user = decoded;
  } catch (err) {
    ctx.state.user = null;
  }
  await next();
};

export default jwtMd;
