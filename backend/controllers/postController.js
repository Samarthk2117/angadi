const { db, admin } = require('../config/firebase');

const getPosts = async (req, res, next) => {
  try {
    const { tag } = req.query;
    let postsRef = db.collection('posts');

    if (tag) {
      postsRef = postsRef.where('tag', '==', tag);
    }

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

const createPost = async (req, res, next) => {
  try {
    const { title, description, tag, imageUrl, authorName } = req.body;

    // Use a fallback authorId since auth is bypassed
    const authorId = req.user ? req.user.uid : 'anonymous_user';
    const name = authorName || (req.user ? req.user.displayName : 'Anonymous Operator');

    const newPost = {
      title: title || '',
      description: description || '',
      tag: tag || null,
      imageUrl: imageUrl || null,
      authorId,
      authorName: name,
      likesCount: 0,
      commentsCount: 0,
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

// COMMENTS
const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const snapshot = await db.collection('comments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'asc')
      .get();
      
    const comments = [];
    snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, authorName } = req.body;
    
    const authorId = req.user ? req.user.uid : 'anonymous_user';
    const name = authorName || (req.user ? req.user.displayName : 'Anonymous Operator');

    const newComment = {
      postId,
      authorId,
      authorName: name,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const commentRef = await db.collection('comments').add(newComment);

    // Increment commentsCount on the post
    await db.collection('posts').doc(postId).update({
      commentsCount: admin.firestore.FieldValue.increment(1)
    });

    res.status(201).json({ id: commentRef.id, ...newComment });
  } catch (error) {
    next(error);
  }
};

// LIKES
const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    // Bypassing auth: we expect userId in body, otherwise fallback
    const { userId } = req.body;
    const uid = req.user ? req.user.uid : (userId || 'anonymous_user');

    const likeId = `${uid}_${postId}`;
    const likeRef = db.collection('likes').doc(likeId);
    const postRef = db.collection('posts').doc(postId);

    const doc = await likeRef.get();
    
    if (doc.exists) {
      // Unlike
      await likeRef.delete();
      await postRef.update({
        likesCount: admin.firestore.FieldValue.increment(-1)
      });
      res.status(200).json({ message: 'Unliked successfully', liked: false });
    } else {
      // Like
      await likeRef.set({
        postId,
        userId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      await postRef.update({
        likesCount: admin.firestore.FieldValue.increment(1)
      });
      res.status(200).json({ message: 'Liked successfully', liked: true });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  getComments,
  addComment,
  toggleLike
};
