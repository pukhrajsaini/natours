const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');
dotenv.config({ path: './../config.env' });
const port = process.env.PORT | 3000;


const DB = process.env.DATABASE;


mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(con => {
  console.log('DB connected successfully');
})


// READ JSON file

const tours = JSON.parse(fs.readFileSync('./tours-simple.json', 'utf-8'));

// IMPORTING data

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data imported successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
}

// DELETING data

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data successfully deleted....');
  } catch (error) {
    console.log(error);
  }
  process.exit();
}

// Calling functions

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);


