const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');

userRouter.post('/signUp', authController.signUp);
userRouter.post('/login', authController.login);

userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);
userRouter.patch('/updateMyPassword', authController.protected, authController.updatePassword);

userRouter.patch('/updateMe', authController.protected, userController.updateMe);
userRouter.delete('/deleteMe', authController.protected, userController.deleteMe);


userRouter.get('/', userController.getAllUsers);






module.exports = userRouter;
