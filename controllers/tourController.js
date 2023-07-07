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
            // query = query.sort('-price');
        }

        // 3) field limiting
        if(req.query.fields){
            const fields=req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }
        else{
            query = query.select('-__v');//eliminate it
        }

        // 4) Pagination
        // http://localhost:3000/api/v1/tours?page=2&limit=10 -> page 2 with limit 10

        const page=req.query.page*1 || 1;//convert it to number & by default get the first page
        const limit=req.query.limit*1 || 100;
        const skip=(page-1)* limit;
        //page=3&limit=10 ,1-10,page1,11-20,page2,21-30,page3


        /**
         * The `skip` variable is calculated by subtracting 1 from the 'page' value and multiplying it by the 'limit'. This calculates the number of documents to skip in the query based on the current page and the specified limit. For example, if 'page' is 3 and 'limit' is 10, the skip value will be 20, indicating that the first 20 documents should be skipped.
         */
        query=query.skip(skip).limit(limit); 

        if(req.query.page){
            const numTours = await Tour.countDocuments();//query to count the number of documents
            if(skip>=numTours)
            throw new Error(`this page doesn't exist`);
        }

        // Execute Query
        const tours = await query;
        //query.sort().select().skip().limit()
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