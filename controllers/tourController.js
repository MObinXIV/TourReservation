const Tour = require('../models/tourModel');

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
        //Build query
        // 1a) filtering
        const queryObj={...req.query}; // get the query object destructured

        // Creating an array of all of fields we want to exclude
        const excludedFields=['page','sort','limit','fields'];
        // next what we want to do is to remove all these fields from the query object
        /**
         * loop through the fields we want to exclude
         * then delete the element in the field from the queryObj guy
         */
        excludedFields.forEach(element => {
            delete(queryObj[element]);});

            console.log(req.query,queryObj);

            // 1b)advanced filtering
            let queryStr = JSON.stringify(queryObj) ;//make the query object as string
            // now we wanna replace any lt,lte,gt,gte with $ in front of each 
           queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`);

        let query = Tour.find(JSON.parse(queryStr)); // we use it like that to chain more queries on it
        //2)Sorting
        if(req.query.sort){
            const sortBy=req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);//sort according to the query I give
        }

        // adding a default sorting 
        else{
            query=query.sort('-createdAt');//sorting by the newly createdAt fields
        }

        // Execute Query
        const tours = await query;

        // send response
        res.status(200).json({
            status:'success',
            results:tours.length,
            data:{
                tours
            }
        })
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