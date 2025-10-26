const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitizeHtml = require('sanitize-html');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//express configuration
app.set('query parser', 'extended'); //to parse query strings with square brackets

//global middlewares
//set security HTTP headers
app.use(helmet()); //need to put helmet middleware at the top

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); //will send 429 error when limit is reached

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //limit request body size

//data sanitization against XSS
app.use(function (req, res, next) {
  // Sanitize req.body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: ['b', 'i', 'em', 'strong', 'p'],
          allowedAttributes: {},
        });
      }
    }
  }
  next();
});

//serving static files
app.use(express.static(`${__dirname}/public`));

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

//routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//catch all
app.all('/*path', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`); //custom error
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //the argument passed to next is assumed to be an error and the rest of the middleware is skipped
});

//global error handler
app.use(globalErrorHandler);

module.exports = app;
