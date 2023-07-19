const express = require('express');
const rateLimit = require('express-rate-limit');
const AppError= require('./utils/appError');
const globalErrHandler= require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app  = express();

// 1) Global middleware 

// allow 100 request from one ip in hour
const limiter = rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message:'Too many requests from tis Ip,please try again in an hour'
});

app.use('/api',limiter); //affect all the routes starts with /api 

app.use(express.json());


app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*',(req,res,next)=>{
    
    next(new AppError(`can't find ${req.originalUrl} on this server!`,404));

});

// use express error handling middleware

app.use(globalErrHandler);

module.exports = app;