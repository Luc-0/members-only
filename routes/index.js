var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');
var messageController = require('../controllers/messageController');

/* GET home page. */
router.get('/', messageController.messageList);

router.get('/sign-up', userController.signUpGet);
router.post('/sign-up', userController.signUpPost);

router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);
router.get('/sign-out', userController.signOut);

router.get('/member', userController.memberGet);
router.post('/member', userController.memberPost);

router.get('/message/new', messageController.newMessageGet);
router.post('/message/new', messageController.newMessagePost);

module.exports = router;
