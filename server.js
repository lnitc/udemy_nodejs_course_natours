const mongoose = require('mongoose');
const dotenv = require('dotenv');

//detect uncaught exceptions
//the server needs to crash because after uncaught exception the whole node environment is compromised
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1); //1 means error
});

dotenv.config({ path: './config.env' });
const app = require('./app'); //import app after dotenv to be able to use morgan

mongoose.connect(process.env.DATABASE).then((con) => {
  // console.log('DB connection successful!', con.connections);
  console.log('DB connection successful!');
});

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

//detect unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  //give the server time to finish handling current requests
  server.close(() => {
    process.exit(1);
  });
});
