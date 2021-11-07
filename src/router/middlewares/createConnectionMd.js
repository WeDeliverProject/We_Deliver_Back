const createConnectionMd = async (ctx, next) => {
  const { dbPool } = ctx;
  const conn = await dbPool.connect();
  ctx.state.conn = conn;

  await next();
};

export default createConnectionMd;
