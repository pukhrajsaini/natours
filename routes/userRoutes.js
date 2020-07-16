const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userControllers');





userRouter.route('/').get(userController.getAllUsers).post(userController.createUser);
userRouter.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deletUser);

module.exports = userRouter;
