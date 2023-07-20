const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize =require('express-mongo-sanitize');
const AppError= require('./utils/appError');
const globalErrHandler= require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const xss=require('xss-clean');
const hpp=require('hpp');
const app  = express();

// 1) Global middleware 

// Set security http headers 
app.use(helmet())

// prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);

// allow 100 request from one ip in hour
// Limit requests from same API 
const limiter = rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message:'Too many requests from this Ip,please try again in an hour'
});

app.use('/api',limiter); //affect all the routes starts with /api 

// body parser, reading data from the body and req.body
app.use(express.json({limit:'10kb'}));

// data Sanitization for nosql injection
app.use(mongoSanitize())
// Against xss
app.use(xss);

// 3) 
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*',(req,res,next)=>{
    
    next(new AppError(`can't find ${req.originalUrl} on this server!`,404));

});

// use express error handling middleware

app.use(globalErrHandler);

module.exports = app;