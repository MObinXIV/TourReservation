const mongoose = require('mongoose');
const validator = require('validator');

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
        minLength:8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm your password'],
       
    },
    photo:String,
});

const User= mongoose.model('User',userSchema);

module.exports=User;