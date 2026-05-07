const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer to use memory storage for Cloudinary stream upload
const upload = multer({ storage: multer.memoryStorage() });

const { getPosts, createPost, getComments, addComment, toggleLike } = require('../controllers/postController.js');

// Public route to get all posts
router.get('/', getPosts);

// Public route to create a post with an optional image upload
router.post('/', upload.single('image'), createPost);

// Comments
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', addComment);

// Likes
router.post('/:postId/like', toggleLike);

module.exports = router;
