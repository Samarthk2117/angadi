const express = require('express');
const { chatProxy } = require('../controllers/chatController');

const router = express.Router();

router.post('/', chatProxy);

module.exports = router;

