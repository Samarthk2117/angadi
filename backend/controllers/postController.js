const { db, admin } = require('../config/firebase');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
    const { title, description, tag, authorName } = req.body;

    const savePostToDb = async (imgUrl) => {
      const authorId = req.user ? req.user.uid : 'anonymous_user';
      const name = authorName || (req.user ? req.user.displayName : 'Anonymous Operator');

      const newPost = {
        title: title || '',
        description: description || '',
        tag: tag || null,
        imageUrl: imgUrl || null,
        authorId,
        authorName: name,
        likesCount: 0,
        commentsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('posts').add(newPost);
      res.status(201).json({ id: docRef.id, ...newPost });
    };

    if (req.file) {
      // Upload to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'cyberhub_posts' },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload failed:", error);
            console.log("error in uploading file");
            return next(error);
            
          }
          savePostToDb(result.secure_url);
        }
      );
      uploadStream.end(req.file.buffer);
    } else {
      // No file uploaded
      await savePostToDb(null);
    }
  } catch (error) {
    next(error);
  }
};

// COMMENTS
const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    
    // Removed orderBy to prevent Firestore Composite Index error
    const snapshot = await db.collection('comments')
      .where('postId', '==', postId)
      .get();
      
    const comments = [];
    snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));

    // Sort manually in memory
    comments.sort((a, b) => {
      const timeA = a.createdAt ? a.createdAt._seconds : 0;
      const timeB = b.createdAt ? b.createdAt._seconds : 0;
      return timeA - timeB; // Ascending order
    });

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
    const { userId } = req.body;
    const uid = req.user ? req.user.uid : (userId || 'anonymous_user');

    const likeId = `${uid}_${postId}`;
    const likeRef = db.collection('likes').doc(likeId);
    const postRef = db.collection('posts').doc(postId);

    await db.runTransaction(async (t) => {
      const likeDoc = await t.get(likeRef);
      const postDoc = await t.get(postRef);

      if (!postDoc.exists) {
        throw new Error("Post does not exist!");
      }

      const currentLikes = postDoc.data().likesCount || 0;

      if (likeDoc.exists) {
        // User already liked it, so UNLIKE
        t.delete(likeRef);
        t.update(postRef, {
          likesCount: Math.max(0, currentLikes - 1) // Prevent dropping below 0
        });
      } else {
        // User hasn't liked it, so LIKE
        t.set(likeRef, {
          postId,
          userId: uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        t.update(postRef, {
          likesCount: currentLikes + 1
        });
      }
    });

    res.status(200).json({ message: 'Like toggled successfully' });
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
