const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt=require('bcryptjs');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'please provide us with name']
    },
    email:{
        type:String,
        required: [true, 'please,tell us your email'],
        unique:true,
        lowercase:true,
        validate: [validator.isEmail, 'please provide a valid email']
    },
    password:{
        type:String,
        required: [true, 'please,provide a password'],
        minLength:8,
        select:false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm your password'],
       validate:{
        // This works only on save and create !!
        validator: function(el){
               return el === this.password;
        },
        message:'passwords are not the same'
       }
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    photo:String,
    
    passwordChangedAt:Date,
    passwordResetToken: String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});

userSchema.pre('save',async function(next){
    // run this function if the password only modified
    if(!this.isModified('password')) return next();

    //Has the password with 12 
    this.password = await bcrypt.hash(this.password,12);//use the async version of hashing

    // delete password confirm field
    this.passwordConfirm=undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/,function(next){
    // this point to the current query
    this.find({active:{$ne:false}});
    next();
})
// use instance method -> this is a method available in all the docs in certain collection
// function to check the correctness of the password
userSchema.methods.correctPassword =async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changesPasswordAfter = function(JWTTimestamp){

    if(this.passwordChangedAt){

        const changedTimeStamp= parseInt(this.passwordChangedAt.getTime()/1000,10);
        console.log(this.passwordChangedAt, JWTTimestamp);
        return JWTTimestamp < changedTimeStamp;
    }
    return false; // by default user don't change his pass first
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User= mongoose.model('User',userSchema);

module.exports=User;