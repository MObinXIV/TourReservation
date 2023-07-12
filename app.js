const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const app  = express();

app.use(express.json());


app.use('/api/v1/tours',tourRouter);

app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`can't find ${req.originalUrl} on this server!`
    // });
    const err = new Error(`can't find ${req.originalUrl} on this server!`);
    err.status='fail';
    err.statusCode=404;
    next(err);
});

// use express error handling middleware

app.use((err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.status=err.status || 'error';
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    })
})

module.exports = app;