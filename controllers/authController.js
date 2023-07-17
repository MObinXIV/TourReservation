const {promisify}=require('util');
const jwt = require('jsonwebtoken');
const User =require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError= require('../utils/appError');

const signToken=   id=>{
   return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

}

exports.signup=catchAsync(async(req,res)=>{
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role:req.body.role
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status:'Success',
        token,
        data:{
        user:newUser
        }
    })
});

exports.login =catchAsync (async(req,res,next)=>{
    const {email,password}=req.body;

    // 1) Check if email and password exists

    if(!email||!password) return next(new AppError('please provide email and password!',400));

    //2) check if user exists and password is correct
    const user =await User.findOne({email}).select('+password');
    // const correct=;

    if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password',401));

    //3) If everything is Ok send the token to the user
    const token=signToken(user._id);
    res.status(200).json({
        status:'success',
        token
    })

});
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token & check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1];
    }
    // console.log(token);

    if(!token) //this means we 're not login
    {
        return next(new AppError('You are not loggedIn! please,login to get access.',401));
    }
    // 2) verification token
        const decoded= await promisify(jwt.verify)(token,process.env.JWT_SECRET);
        // console.log(decoded);
    // 3) check if user still exist 
    const currentUser= await User.findById(decoded.id);
    if(!currentUser) // if the user deleted
    {
        return next(new AppError('The user belonging to this token no longer exists',401));
    }

    //4) check if user changed password after the token was issued
    if(currentUser.changesPasswordAfter(decoded.iat))
    return next(new AppError('User recently changed his password! please login Again',401));

    req.user=currentUser;
    // Grant access to the next route
    next();
});

exports.restrictTo=(...roles)=>{
   return (req,res,next)=>{
        if(!roles.includes(req.user.role))
        return next(new AppError('You do not have a permission to perform that action',403));
       next();
    }
    
}

exports.forgotPassword = catchAsync(async(req,res,next)=>{
    // 1) Get user based on posted email

    const user= await User.findOne({email:req.body.email});
    
    if (!user)
    {
        return next(new AppError('There is no user exists with this email',404));
    }
    // 2) Generate the random reset token

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});
    // 3) Send it to user's email
});
exports.resetPassword = (req, res, next) => { }