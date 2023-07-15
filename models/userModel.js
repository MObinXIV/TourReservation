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
       validate:{
        // This works only on save and create !!
        validator: function(el){
               return el === this.password;
        },
        message:'passwords are not the same'
       }
    },
    photo:String,
});

const User= mongoose.model('User',userSchema);

module.exports=User;