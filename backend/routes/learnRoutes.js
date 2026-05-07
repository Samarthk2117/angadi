const express = require('express');
const multer = require('multer');
const { getItems, createItem, getComments, addComment, toggleLike } = require('../controllers/learnController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const allowedTypes = new Set(['videos', 'articles', 'faqs']);
const socialTypes = new Set(['videos', 'articles']);

const validateType = (req, res, next) => {
  if (!allowedTypes.has(req.params.type)) {
    return res.status(400).json({ message: 'Invalid learn content type.' });
  }
  return next();
};

const validateSocialType = (req, res, next) => {
  if (!socialTypes.has(req.params.type)) {
    return res.status(400).json({ message: 'Likes/comments are only supported for videos and articles.' });
  }
  return next();
};

router.get('/:type', validateType, getItems);
router.post('/:type', validateType, upload.single('image'), createItem);

router.get('/:type/:itemId/comments', validateSocialType, getComments);
router.post('/:type/:itemId/comments', validateSocialType, addComment);
router.post('/:type/:itemId/like', validateSocialType, toggleLike);

module.exports = router;
