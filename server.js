const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.DATABASE).then((con) => {
  console.log('DB connection successful!', con.connections);
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
