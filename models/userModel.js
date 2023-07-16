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
    photo:String,
    passwordChangedAt:Date
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

const User= mongoose.model('User',userSchema);

module.exports=User;