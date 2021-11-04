const responseMd = async (ctx) => {
  const { body, conn } = ctx.state;

  ctx.state = 200;

  ctx.body = body;

  if (conn) {
    conn.release();
  }
};

export default responseMd;
