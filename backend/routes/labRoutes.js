const express = require('express');
const router = express.Router();
const { getLab } = require('../controllers/labController');

router.get('/:labId', getLab);

module.exports = router;
