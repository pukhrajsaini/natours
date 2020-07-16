const express = require('express');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
app.use(express.json());

console.log(process.env);

app.use(express.static(`${__dirname}/public`));


app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);




module.exports = app;
