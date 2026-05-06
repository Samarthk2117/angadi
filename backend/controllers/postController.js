const { db, admin } = require('../config/firebase');

/**
 * @desc    Get posts, optionally filtered by tag
 * @route   GET /api/posts
 * @access  Public
 */
const getPosts = async (req, res, next) => {
  try {
    const { tag } = req.query;
    let postsRef = db.collection('posts');

    if (tag) {
      postsRef = postsRef.where('tag', '==', tag);
    }

    // Fetch posts ordered by createdAt descending
    const snapshot = await postsRef.orderBy('createdAt', 'desc').get();
    
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { title, description, tag } = req.body;

    // Use a fallback authorId if auth is bypassed
    const authorId = req.user ? req.user.uid : 'anonymous_user';

    const newPost = {
      title: title || '',
      description: description || '',
      tag: tag || null,
      authorId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('posts').add(newPost);

    res.status(201).json({
      id: docRef.id,
      ...newPost
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost
};
