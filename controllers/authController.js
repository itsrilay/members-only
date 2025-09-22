const passport = require('passport');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getSignUpForm = (req, res) => {
  res.render('sign-up-form', { title: 'Sign Up' });
};

exports.postSignUpForm = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
      req.body.username,
      hashedPassword,
    ]);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getLogInForm = (req, res) => {
  res.render('log-in-form', { title: 'Log In' });
};

exports.postLogInForm = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
  })(req, res, next);
};

exports.getLogOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};
