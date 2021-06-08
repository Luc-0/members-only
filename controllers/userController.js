const { body, validationResult, check } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/user');

exports.signUpGet = function (req, res, next) {
  res.render('user-form', {
    title: 'Sign up',
    btnText: 'Sign up',
  });
};

exports.signUpPost = [
  body('firstName')
    .trim()
    .escape()
    .isLength({ min: 1, max: 30 })
    .withMessage('Length of 1-30 characters.'),
  body('lastName')
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Max length of 50 characters.'),
  body('username')
    .trim()
    .escape()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username length needs to be in the range of 3-30 characters.')
    .isAlphanumeric()
    .withMessage('Only alphanumeric characters.'),
  check('username', 'Username already in use.')
    .if(body('username').isLength({ min: 3, max: 30 }).isAlphanumeric())
    .custom((value, { req }) => {
      return User.findOne({ username: value }, function (err, user) {
        if (err) {
          console.log('error checking username');
          throw new Error('Invalid username');
        }
        if (user) {
          return false;
        }
        return true;
      });
    }),
  body('password')
    .isLength({ min: 3, max: 150 })
    .withMessage(
      'Password length needs to be in the range of 3-150 characters.'
    ),
  check('confirmPassword', 'Password does not match.')
    .exists()
    .custom((value, { req }) => value === req.body.password),
  (req, res, next) => {
    const errorResults = validationResult(req);
    const hasErrors = !errorResults.isEmpty();

    const userDetail = {
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };

    console.log(errorResults);

    if (hasErrors) {
      return res.render('user-form', {
        title: 'Sign up',
        btnText: 'Sign up',
        user: userDetail,
        errors: errorResults.errors,
      });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
          return next(err);
        }

        const newUser = new User({
          ...userDetail,
          password: hashedPassword,
        }).save((err) => {
          if (err) {
            return next(err);
          }
          res.redirect('/');
        });
      });
    }
  },
];

exports.loginGet = function (req, res) {
  const hasError = req.flash().error;

  if (hasError) {
    return res.render('login', {
      errorMessage: 'Invalid credentials',
    });
  }
  res.render('login');
};

exports.loginPost = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
});

exports.signOut = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.memberGet = function (req, res) {
  if (!req.user) {
    return res.redirect('/login');
  }

  res.render('member');
};

exports.memberPost = function (req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }

  const userPassword = req.body.secretPassword;

  if (process.env.SUPER_SECRET_MEMBER_PASSWORD != userPassword) {
    return res.render('member', {
      message: 'Wrong answer!',
    });
  } else {
    const userId = req.user._id;

    const updatedUser = new User({
      ...req.user,
      membershipStatus: 'Member',
      _id: userId,
    });
    User.findByIdAndUpdate(userId, updatedUser, function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/member');
    });
  }
};
