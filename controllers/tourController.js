const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const mongoose = require('mongoose');
const factory = require('./handlerFactory');

function getAllTours(req, res, next) {
  factory.getAll(Tour)(req, res, next);
}

function createTour(req, res, next) {
  factory.createOne(Tour)(req, res, next);
}

function getTour(req, res, next) {
  factory.getOne(Tour, { path: 'reviews' })(req, res, next);
}

function updateTour(req, res, next) {
  factory.updateOne(Tour)(req, res, next);
}

function deleteTour(req, res, next) {
  factory.deleteOne(Tour)(req, res, next);
}

function aliasTopTours(req, res, next) {
  const query = {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };

  //query is immutable since express v5, so it's just a workaround for the course sake
  Object.defineProperty(req, 'query', {
    ...Object.getOwnPropertyDescriptor(req, 'query'),
    writable: false,
    value: query,
  });

  next();
}

async function getTourStats(req, res, next) {
  catchAsync(async () => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          //_id: null,
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      //match can be used multiple times
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  })(req, res, next);
}

async function getMonthlyPlan(req, res, next) {
  catchAsync(async () => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0, //0 to exclude, 1 to include
        },
      },
      {
        $sort: { numTourStarts: -1 }, //-1 for descending
      },
      {
        $limit: 12,
      },
    ]);

    if (plan.length === 0) {
      res.status(404).json({
        status: 'fail',
        message: 'Plan not found',
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: {
          plan,
        },
      });
    }
  })(req, res, next);
}

function checkID(req, res, next, val) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return next(new AppError('Invalid ID', 400));
  next();
}

function getToursWithin(req, res, next) {
  catchAsync(async () => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng)
      return next(new AppError('Please provide latitude and longitude', 400));

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  })(req, res, next);
}

function getDistances(req, res, next) {
  catchAsync(async () => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng)
      return next(new AppError('Please provide latitude and longitude', 400));

    const distances = await Tour.aggregate([
      {
        //geoNear always needs to be the first stage in the pipeline
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      },
    });
  })(req, res, next);
}

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  checkID,
  getToursWithin,
  getDistances,
};
