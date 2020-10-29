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
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(con => {
  console.log('DB connected successfully');
}).catch(err => console.log(err));


app.listen(port, () => console.log(`server started at port ${port}`));

// process.on('unhandledRejection', err => {
//   console.log(err.name, err.message);
//   console.log('Shutting down...');

//   server.close(()=>{
//     process.exit();
//   })
// })
