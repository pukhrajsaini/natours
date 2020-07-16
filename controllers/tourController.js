
const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      data: {
        tours: tours
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'not Found',
      data: err
    })
  }
}

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'not Found',
      data: err
    })
  }
}
exports.createTour = async (req, res) => {
  try {
    let newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newTour
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err
    });
  }
}


exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.status(200).json({
      status: 'success',
      data: {
        updatedTour: tour
      }
    })
  } catch (err) {
    res.status(404).json({
      status: 'not Found',
      data: JSON.stringify(err + 'Invalid data sent')
    })
  }
}

exports.deleteTour =async (req, res) => {
  try{
    await Tour.findByIdAndDelete(req.params.id);
    res.status(400).json({
      status: 'success',
      data: null
    });
  }catch(err){
    res.status(404).json({
      status: 'failed',
      message: `no Tours with this ${req.params.id} Id.. `
    });
  }
}
