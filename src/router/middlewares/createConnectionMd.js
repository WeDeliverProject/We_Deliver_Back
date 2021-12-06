const createConnectionMd = async (ctx, next) => {
  const { dbClient } = ctx;
  await dbClient.connect();
  const db = dbClient.db('myProject');
  ctx.state.conn = db;

  await next();
};

export default createConnectionMd;
