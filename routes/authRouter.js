const { Router } = require('express');
const authRouter = Router();
const authController = require('../controllers/authController');

authRouter.get('/sign-up', authController.getSignUpForm);
authRouter.post('/sign-up', authController.postSignUpForm);
authRouter.get('/log-in', authController.getLogInForm);
authRouter.post('/log-in', authController.postLogInForm);
authRouter.get('/log-out', authController.getLogOut);

module.exports = authRouter;
