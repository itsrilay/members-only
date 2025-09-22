const passport = require('passport');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username cannot be empty.')
    .isAlphanumeric()
    .withMessage('Username cannot contain non-alphanumeric characters.'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password cannot be empty.')
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be between 8 and 64 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.'),
];

exports.getSignUpForm = (req, res) => {
  res.render('sign-up-form', { title: 'Sign Up', errors: [], data: null });
};

exports.postSignUpForm = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('sign-up-form', {
        title: 'Sign Up',
        errors: errors.array(),
        data: req.body,
      });
    }
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2)',
        [req.body.username, hashedPassword]
      );
      req.flash('success', 'Account created successfully. You can log in now.');
      res.redirect('/log-in');
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).render('sign-up-form', {
          title: 'Sign Up',
          errors: [{ msg: 'Username is already taken.' }],
          data: req.body,
        });
      }
      console.error(error);
      next(error);
    }
  },
];

exports.getLogInForm = (req, res) => {
  res.render('log-in-form', {
    title: 'Log In',
    errors: req.flash('error'),
    success: req.flash('success'),
  });
};

exports.postLogInForm = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
    failureFlash: true,
  })(req, res, next);
};

exports.getLogOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Logged out sucessfully.');
    res.redirect('/');
  });
};
