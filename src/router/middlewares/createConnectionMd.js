const createConnectionMd = async (ctx, next) => {
  const { dbPool } = ctx;
  const conn = await dbPool.getConnection();
  ctx.state.conn = conn;

  await next();
};

export default createConnectionMd;
