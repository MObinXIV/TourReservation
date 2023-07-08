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
        ratingsAverage:{
            type:Number,
            default:4.5
        },
        ratingsQuantity: {
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
        startDates:[Date]
    }
    ,
    {
        toJSON:{virtuals:true}, // each time we get json data we get virtuals
        toObject: { virtuals: true }
    }
);

// use the virtual property to get the duration in week
/// note that , we cannot query it also as it doesn't part of db
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
})

const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;