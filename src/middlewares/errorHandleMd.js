const errorHandleMd = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err);
    if (err.isBoom) {
      ctx.status = err.output.statusCode;
      ctx.body = {
        error: err.output.payload.error,
        message: err.output.payload.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        error: "internal server error",
        message: "internal server error",
      };
    }
  } finally {
    if (ctx.state.conn) {
      ctx.state.conn.release();
    }
  }
};

export default errorHandleMd;
