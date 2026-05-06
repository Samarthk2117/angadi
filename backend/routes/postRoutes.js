const express = require('express');
const router = express.Router();
const { getPosts, createPost } = require('../controllers/postController.js');

// Public route to get all posts (optionally filtered by tag via query param)
router.get('/', getPosts);

// Public route to create a post (auth removed for testing)
router.post('/', createPost);

module.exports = router;
