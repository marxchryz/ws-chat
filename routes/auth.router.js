const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authController } = require('../controllers');

router.route('/login').post(authController.post);

module.exports = router;
