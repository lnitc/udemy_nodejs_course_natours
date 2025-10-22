const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app'); //import app after dotenv to be able to use morgan

mongoose.connect(process.env.DATABASE).then((con) => {
  // console.log('DB connection successful!', con.connections);
  console.log('DB connection successful!');
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
