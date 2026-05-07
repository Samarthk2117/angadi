const express = require('express');
const { getRecentAlerts, getLatestAnalytics } = require('../controllers/monitoringController');

const router = express.Router();

router.get('/alerts', getRecentAlerts);
router.get('/analytics/latest', getLatestAnalytics);

module.exports = router;

