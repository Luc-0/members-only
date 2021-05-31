#! /usr/bin/env node

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var User = require('./models/user');
var Message = require('./models/message');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const users = [];

function createUsers(cb) {
  console.log('Creating users...');
  async.parallel(
    [
      function (callback) {
        createUser('luc-0', 'nop', 'Lucas', '', 'Member', callback);
      },
      function (callback) {
        createUser('lucas', '123', 'Luke', 'No', 'Not-member', callback);
      },
      function (callback) {
        createUser('lucius', 'yes', 'Lucius', 'Yes', 'Not-member', callback);
      },
    ],
    function (err, results) {
      if (err) {
        console.log('Error creating users: ' + err);
        cb(err, null);
        return;
      }
      console.log('Done creating users');
      cb(null, results);
    }
  );
}

function createUser(
  username,
  password,
  firstName,
  lastName,
  membershipStatus,
  cb
) {
  const newUser = new User({
    username: username,
    password: password,
    firstName: firstName,
    lastName: lastName,
    membershipStatus: membershipStatus,
  });

  newUser.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New User: ' + newUser);
    users.push(newUser);
    cb(null, newUser);
  });
}

function createMessages(cb) {
  console.log('Creating messages...');
  async.parallel(
    [
      function (callback) {
        createMessage(
          'First message',
          'this is the first message',
          users[0]._id,
          callback
        );
      },
      function (callback) {
        createMessage(
          'Second message',
          'Second message',
          users[1]._id,
          callback
        );
      },
      function (callback) {
        createMessage('Third', "I'm the third I guess", users[2]._id, callback);
      },
    ],
    function (err, results) {
      if (err) {
        console.log('Error creating messages: ' + err);
        cb(err, null);
        return;
      }
      console.log('Done creating messages.');
      cb(null, results);
    }
  );
}

function createMessage(title, message, userId, cb) {
  const timestamp = new Date();
  const newMessage = new Message({
    title: title,
    message: message,
    timestamp: timestamp,
    user: userId,
  });

  newMessage.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }

    console.log('New Message: ' + newMessage);
    cb(null, newMessage);
  });
}

async.series([createUsers, createMessages], function (err) {
  if (err) {
    console.log('Error populating database: ' + err);
    return;
  }
  console.log('Done populating database.');

  mongoose.connection.close();
});
