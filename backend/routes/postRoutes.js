const express = require('express');
const router = express.Router();
const { getPosts, createPost, getComments, addComment, toggleLike } = require('../controllers/postController.js');

// Public route to get all posts
router.get('/', getPosts);

// Public route to create a post
router.post('/', createPost);

// Comments
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', addComment);

// Likes
router.post('/:postId/like', toggleLike);

module.exports = router;
