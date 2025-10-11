const fs = require('fs');
const Tour = require('./../models/tourModel');

function getAllTours(req, res) {
  res.status(200).json({
    status: 'success',
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
}

async function createTour(req, res) {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
}

function getTour(req, res) {
  // const tour = findTour(req, tours);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
}

function updateTour(req, res) {
  res.status(200).json({
    status: 'success',
    data: {
      tour: req.body,
    },
  });
}

function deleteTour(req, res) {
  res.status(204).json({
    status: 'success',
    data: null,
  });
}

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
};
