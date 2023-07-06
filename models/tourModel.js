const mongoose  = require("mongoose");

const tourSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true,'A tour must have a name'],
            unique:true,
            trim:true
        },
        duration:{
            type:Number,
            require:[true,'A Tour must have a duration']
        },
        maxGroupSize:{
            type:Number,
            required:[true,'A Tour must have group size']
        }
        ,

        difficulty:{
            type:String,
            required:[true,'a Tour must have a difficulty']
        },
        ratingAverage:{
            type:Number,
            default:4.5
        },
        ratingQuantity: {
            type: Number,
            default: 0
        },
        price:{
            type:Number,
            required:[true,'A tour must have a price']
        },

        priceDiscount:Number,
        summary:{
            type:String,
            trim:true,
            required:[true,'a Tour must have a summary']
        },
        description:{
            type:String,
            trim:true
        },
        imageCover: // we save the image in the file system , but we put the name of the image itself in the db
        {
            type:String,
            required:[true,'A Tour must have a cover image']
        },
        images:[String],
        createdAt:{
            type:Date,
            default:Date.now(),
            select:false
        },
        starDates:[Date]
    }
);


const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;