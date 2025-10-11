const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

function findTour(req, tours) {
  const id = req.params.id * 1;
  return tours.find((el) => el.id === id);
}

function checkID(req, res, next, val) {
  if (req.params.id * 1 >= tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
}

function checkBody(req, res, next) {
  if (!('price' in req.body) || !('name' in req.body)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
}

function getAllTours(req, res) {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
}

function createTour(req, res) {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        //201 status stands for created
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
}

function getTour(req, res) {
  const tour = findTour(req, tours);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
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
  checkID,
  checkBody,
};
