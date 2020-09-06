const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const viewRouter = require('./routes/viewRoutes.js');

const app = express();
app.set('view engine', 'pug');
//serving static files
app.set('views', path.join(__dirname, 'views'));

//Set security http
app.use(helmet());

const eventRouter = require('./routes/eventRoutes.js');
const userRouter = require('./routes/userRoutes.js');
//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: ' Too many requests on this IP.Please try again in an hour!!'
});
app.use('/api', limiter);
app.use(morgan('dev'));
app.use(
  express.json({
    limit: '10kb'
  })
);
app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());
//Prevent parameter pollution
app.use(hpp());

//Routers

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
