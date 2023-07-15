const mongoose  = require("mongoose");
const slugify = require('slugify');
// const validator = require('validator');
const tourSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true,'A tour must have a name'],
            unique:true,
            trim:true,
            maxlength: [40, 'A tour name must have less than or equal to 40 characters'],
            minlength: [10, 'A tour name must have at least 10 character'],
            // validate: [validator.isAlpha,'tour name must only something character']

        },
        slug:String,
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
            required:[true,'a Tour must have a difficulty'],
            enum:{
                values:['easy','medium','difficult'],
                message: 'Difficulty is either easy,medium or difficult'
        }
        },
        ratingsAverage:{
            type:Number,
            default:4.5,
            min:[1.0,'Rating must be above 1.0'],
            max: [5.0, 'Rating must be below 5.0']
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price:{
            type:Number,
            required:[true,'A tour must have a price']
        },

        priceDiscount:{type:Number,
            // *validate allow us to create our custom validator
            validate:{
            // *val is priceDiscount
            validator:function(val){
                // *this only points to the current doc on New document creation
                return val < this.price;
            },
                message: 'Discount price ({VALUE}) must be below regular Price' //({VALUE}) -> val

        }
        },
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
        startDates:[Date],
        secretTour:{
            type:Boolean,
            default:false
        }
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


/**
 * * important :
 * * pre running before a certain event
 * * post ->running after
 * * and the event is save event
 * * and we have to reach this 
 */
//* Doc middleware(access the document) -> it runs before .save() & .create()
//* pre running before a certain event
tourSchema.pre('save',function(next){

    // this -> here points to the current document
    this.slug=slugify(this.name,{lower:true});
    next();
});

// get the document after it created with all it's data
//* * post ->running after
// tourSchema.post('save',function(doc,next){
//     console.log(doc);
//     next();
// })

//Query middleware
/**
 * 
 * we use it to hide the secret tours
 * we handle each find situation with regex
 */
tourSchema.pre(/^find/,function(next)
// tourSchema.pre('find', function (next)
{
    // this -> points to the current query
    this.find({secretTour:{$ne:true}});
    this.start= Date.now();
    next();
});

tourSchema.post(/^find/,function(docs,next){
    console.log(`Query take ${Date.now()-this.start} milliseconds!`);
    console.log(docs);
    next();
});

// Aggregation middleware

tourSchema.pre('aggregate',function(next){
    // this -> points to the current aggregation option
    
    // remove the docs from the aggregation
    this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
    next();
})

const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;