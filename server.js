const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });
const port = process.env.PORT | 3000;

 const DB = process.env.DATABASE;
// const DB = process.env.DATABASE_LOCAL

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(con => {
  console.log('DB connected successfully');
})


app.listen(port, () => console.log(`server started at port ${port}`));
