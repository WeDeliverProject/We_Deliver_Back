const validataListParamMd = async (ctx, next) => {
  let { skip, limit } = ctx.query;

  if (!skip) skip = "0";
  if (!limit) limit = "10";

  ctx.state.query = {
    skip: parseInt(skip, 10),
    limit: parseInt(limit, 10),
  };

  await next();
};

export default validataListParamMd;
