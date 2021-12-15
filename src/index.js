import Koa from "koa";
import serve from "koa-static";
import KoaBody from "koa-body";
import path from "path";
import Config from "./config";
import Router from "./router";
import { errorHandleMd } from "./middlewares";
import { createServer } from "http";
import { MongoClient } from "mongodb";
import NodeCache from "node-cache";

const client = new MongoClient(Config.DB_URL);

const app = new Koa();
const server = createServer(app.callback());

const cache = new NodeCache()


const main = async () => {
  
  try {
    app.use(
      KoaBody({
        multipart: true,
        formidable: {
          uploadDir: path.join(__dirname, "../upload"),
          keepExtensions: true,
        },
      })
    );

    // 데이터베이스 Pool을 Koa Context에 저장한다.
    app.context.dbClient = client;
    app.context.cache = cache;
    app.use(errorHandleMd);
    app.use(Router.routes()).use(Router.allowedMethods());
    app.use(serve(path.join(__dirname, "../upload")));
    server.listen(3000);
    console.log("WeDeliver Server started");
  } catch (e) {
    console.log(e);
  }
};

main();
