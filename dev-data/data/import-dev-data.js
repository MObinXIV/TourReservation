const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' })


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,

}).then(() => console.log('DB connection successful!'));

// read Json file 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')) ;//JSON.parse() , method that is used to convert string to json

// Import data into database 

const importData = async()=>{
    try {
        await Tour.create(tours);
        console.log(`Data is successfully Loaded`);
        process.exit();
    } catch (error) {
        console.log(error);
    }
    
}

// Delete all the data from Db 

const deleteData= async()=>{
    try {
        await Tour.deleteMany();
        console.log(`data was deleted successfully`);
        process.exit();
    } catch (error) {
        console.log(error);
    }
};
/**'C:\\Program Files\\nodejs\\node.exe',
  'd:\\node\\TourReservation\\dev-data\\data\\import-dev-data.js',
  '--import'[2] */
if (process.argv[2]=='--import')
{
    importData();
}

else if (process.argv[2] == '--delete'){
    deleteData();
}

