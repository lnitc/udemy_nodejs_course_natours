const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

function getAllTours(req, res, next) {
  catchAsync(async () => {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  })(req, res, next);
}

function createTour(req, res, next) {
  catchAsync(async () => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  })(req, res, next);
}

function getTour(req, res, next) {
  catchAsync(async () => {
    const tour = await Tour.findById(req.params.id); //same as Tour.findOne({ _id: req.params.id })
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  })(req, res, next);
}

function updateTour(req, res, next) {
  catchAsync(async () => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  })(req, res, next);
}

function deleteTour(req, res, next) {
  catchAsync(async () => {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  })(req, res, next);
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

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
