
const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllTours = catchAsync(async (req, res, next) => {
  let toursQuery = Tour.find();
  const queryString = req.query;
  const apiFeatures = new ApiFeatures(toursQuery, queryString)
    .filtering()
    .pagination()
    .fieldsLimiting()
    .sorting();

  // Execute Tours Query
  let tours = await apiFeatures.toursQuery;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours
    }
  })
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError(`no tour found with this ID: ${req.params.id}`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour
    }
  });
});


exports.createTour = catchAsync(async (req, res, next) => {
  let newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newTour
  });
})


exports.updateTour = catchAsync(async (req, res,next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppError(`no tour found with this ID: ${req.params.id}`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      updatedTour: tour
    }
  })
})

exports.deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`no tour found with this ID: ${req.params.id}`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
})

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: '$difficulty',
        numberOfTours: { $sum: 1 },
        numberOfRatingsQuantity: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      },
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats: stats
    }
  })
})

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  console.log(year);

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numToursStarts: -1 }
    }
  ])

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  })
})
