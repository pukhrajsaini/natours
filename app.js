const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Global Middleware

//set security http headers

app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit request from the same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this Ip, please try again after one hour'
});

app.use('/api', limiter);


// bodyParser reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// data sanitization against NoSql Query Injection 
app.use(mongoSanitize());

// data sanitization against XSS 
app.use(xss());

// prevent parameter pollution
app.use(hpp(
  {
    whitelist: [
      'ratingsAverage',
      'duration',
      'difficulty',
      'maxGroupSize',
      'price',
      'ratingsQuantity'
    ]
  }
));
// serving Static Files
app.use(express.static(`${__dirname}/public`));

// test middleware

app.use((req, res, next) => {
  req.requestTime = Date.now().toString();

  next();
})

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);



app.all('*', (req, res, next) => {
  // const err = new Error();
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
})

app.use(globalErrorHandler);

module.exports = app;
