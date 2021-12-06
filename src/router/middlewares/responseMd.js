const responseMd = async (ctx) => {
  const { body } = ctx.state;
  const { dbClient } = ctx;

  ctx.state = 200;

  ctx.body = body;

  dbClient.close();

};

export default responseMd;
