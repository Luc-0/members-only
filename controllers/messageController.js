const { body, validationResult } = require('express-validator');

const Message = require('../models/message');

exports.messageList = function (req, res, next) {
  Message.find({})
    .populate('user')
    .exec(function (err, messages) {
      if (err) {
        return next(err);
      }

      res.render('messageList', {
        messages: messages,
      });
    });
};

exports.newMessageGet = function (req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  res.render('messageForm', {
    title: 'New message',
    btnText: 'Create message',
  });
};

exports.newMessagePost = [
  body('title', 'Length needs to be in the range of 1-50 characters.')
    .trim()
    .escape()
    .isLength({ min: 1, max: 50 }),
  body('message', 'Length needs to be in the range of 1-300 characters')
    .trim()
    .escape()
    .isLength({ min: 1, max: 300 }),
  (req, res, next) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    const errorResult = validationResult(req);
    const hasError = !errorResult.isEmpty();

    const message = {
      title: req.body.title,
      message: req.body.message,
    };

    if (hasError) {
      return res.render('messageForm', {
        title: 'New message',
        btnText: 'Create message',
        message: message,
        errors: errorResult.errors,
      });
    }

    const newMessage = new Message({
      ...message,
      user: req.user._id,
    });

    newMessage.save(function (err) {
      if (err) {
        return next(err);
      }

      res.redirect('/');
    });
  },
];

exports.deleteMessage = function (req, res, next) {
  if (!req.user || req.user.membershipStatus != 'Admin') {
    return res.redirect('/login');
  }
  const messageId = req.body.messageId;

  Message.findByIdAndRemove(messageId, function (err) {
    if (err) {
      return next(err);
    }

    res.redirect('/');
  });
};
