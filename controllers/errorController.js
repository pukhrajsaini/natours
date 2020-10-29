const AppError = require("../utils/appError");


const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field request ${value}, please use another value.`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `invalid data sent: ${errors.join(', ')}`;
  return new AppError(message, 400);
}

const handleJwtError = () => {
  return new AppError('Invalid token, please log in again!', 401);
};

const handleExpiredTokenError = () => {
  return new AppError('Token Expired, please logIn again', 401);
}
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
};

const sendErrorProd = (err, res) => {
  // operational errors : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // programming or other unknown errors : don't want to leak error details
  } else {
    // 1) log the errors
    console.error('Error : ' + err);
    // 2) send a generic message
    res.status(500).json({
      status: 'fail',
      message: 'Something Went Wrong',
    })
  }
};
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {

    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(error);
    if (!error.message) error.message = err.message;
    if (error.name === 'CasteError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === 'Validation failed') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtError();
    if (error.name === 'TokenExpiredError') error = handleExpiredTokenError();

    sendErrorProd(error, res);
  }
}

module.exports = globalErrorHandler;