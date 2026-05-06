const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // Only show the stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

module.exports = errorHandler;
