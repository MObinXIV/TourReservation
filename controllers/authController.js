const crypto = require('crypto');
const {promisify}=require('util');
const jwt = require('jsonwebtoken');
const User =require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError= require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken=   id=>{
   return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

}
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
exports.resetPassword = catchAsync (async (req, res, next) => { 
  // 1) get user based on the token
  const hashedToken= crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}});

  // 2) if token hasn't expired , and there's user , set a new password
  if(!user)
  {
    return next(new AppError('token is invalid or expired',400));
  }
  user.password=req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken=undefined;
  user.passwordResetExpires=undefined;
  await user.save();

  // 3) update changedPasswordAt property for the user 

  // 4) log the user in send, Jwt
  createSendToken(user, 200, res);

});