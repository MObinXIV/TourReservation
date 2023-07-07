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
            message:'Invalid data sent!'
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