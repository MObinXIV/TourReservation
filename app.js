const express = require('express');
const AppError= require('./utils/appError');
const globalErrHandler= require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app  = express();

app.use(express.json());


app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*',(req,res,next)=>{
    
    next(new AppError(`can't find ${req.originalUrl} on this server!`,404));

});

// use express error handling middleware

app.use(globalErrHandler);

module.exports = app;