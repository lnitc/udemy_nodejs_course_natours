const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.DATABASE).then((con) => {
  console.log('DB connection successful!', con.connections);
});

//READ JSON FILE
const tours = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8');

//IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
