const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// middleware to handle the top-5-cheap route 
exports.aliasTopTours= (req,res,next)=>{
    req.query.limit='5';
    req.query.sort  = '-ratingsAverage,price';
    req.query.fields ='name,ratingsAverage,price,summary,difficulty';
    next();
}

exports.createTour = async (req,res)=>{
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status:'success',
            data:{
                tour:newTour
            }
        })
    } catch (error) {
        res.status(400).json({
            status:'fail',
            message:error
        })
    }
}




exports.getAllTours = async(req,res)=>{
    
    try {
        // build my query
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
            // execute it
        const tours = await features.query;
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (error) {
        res.status(400).json({
            status:'fail',
            message:'Invalid data sent!'
        })
    }
};

exports.getTour = async(req,res)=>{

    try {
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status:'success',
            data:{
                tour
            }
        })

    } catch (error) {

        res.status(400).json({
            status:'fail',
            message:'Invalid data sent!'
        })
    }
}

exports.updateTour = async (req,res)=>{
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});

        res.status(200).json({
            status:'success',
            data:{
                tour
            }
        })
    } catch (error) {
        res.status(400).json({
            status:'fail',
            message:'Invalid data sent!'
        })
    }
}

exports.deleteTour = async(req,res)=>{
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status:'Success',
            data:null
        })
    } catch (error) {
        res.status(400).json({
            status:'fail',
            message:'Invalid data sent!'
        })
    }
}

exports.getTourStats = async(req, res)=>{
    try {
    const stats= await Tour.aggregate([
        {
            $match: {ratingsAverage: {$gte: 4.5}} // used to select documents or just do a query
        },
        {
            $group:{
                // _id:'$ratingsAverage',
                _id:{$toUpper:'$difficulty'}, //here it 'll give me the statistics for every difficulty
                /*
                * {
    "status": "success",
    "data": {
        "stats": [
            {
                "_id": "difficult",
                "numTours": 2,
                "numRatings": 41,
                "avgRating": 4.6,
                "avgPrice": 1997,
                "minPrice": 997,
                "maxPrice": 2997
            },
            {
                "_id": "easy",
                "numTours": 4,
                "numRatings": 159,
                "avgRating": 4.675,
                "avgPrice": 1272,
                "minPrice": 397,
                "maxPrice": 1997
            },
            {
                "_id": "medium",
                "numTours": 3,
                "numRatings": 70,
                "avgRating": 4.8,
                "avgPrice": 1663.6666666666667,
                "minPrice": 497,
                "maxPrice": 2997
            }
        ]
    }
}
                * */
                numTours:{$sum:1},
                numRatings: {$sum:'$ratingsQuantity'},
                //calculate the averageRating
                avgRating: {$avg:'$ratingsAverage'},
                avgPrice: {$avg:'$price'},
                minPrice: {$min:'$price'},
                maxPrice: {$max:'$price'}
                /// important note -> these names are now the names we use not the old real names
            }
        },
        {
            $sort:{avgPrice:1}
        },
        // {
        //     $match:{_id:{$ne:'EASY'}} // excluding the easy
        // }
    ])

        res.status(200).json({
            status:'success',
            data:{
                stats
            }
        })
    }
    catch (error) {

        res.status(400).json({
            status:'fail',
            message:'Invalid data sent!'
        });
    }
}

exports.getMonthlyPlan=async(req,res)=>{
    try {
        const year=req.params.year*1;

        const plan = await Tour.aggregate([
            {
                $unwind:'$startDates' // make us only have one document for each date
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'}, // extracting the month , using mongoDb feature hahaha
                    //count the amount of tours that happens in a certain month
                    numToursStart:{$sum:1},
                    //create an array of tours
                    tours:{$push:'$name'} // push the name of the tour

                },
               
            }
            ,
            {
                $addFields: { month: '$_id' }
            },
            {
                $project:{
                    _id:0
                }
            },
            {
                $sort:{numToursStart:-1}
            },
            {
                $limit:12
            }

        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!'
        });
    }
}