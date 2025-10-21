const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.set('query parser', 'extended'); //to parse query strings with square brackets

//middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); //middleware to be able to use req.body
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
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
