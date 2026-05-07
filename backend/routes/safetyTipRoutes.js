const express = require('express');
const {
  getSafetyTips,
  createSafetyTip,
  toggleSafetyTipLike,
} = require('../controllers/safetyTipController');

const router = express.Router();

router.get('/', getSafetyTips);
router.post('/', createSafetyTip);
router.post('/:tipId/like', toggleSafetyTipLike);

module.exports = router;

