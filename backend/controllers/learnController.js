const { db, admin } = require('../config/firebase');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CONTENT_CONFIG = {
  videos: {
    collection: 'videos',
    commentsCollection: 'videoComments',
    likesCollection: 'videoLikes',
    titleField: 'title',
    bodyField: 'description',
    linkField: 'videoUrl',
    imageField: 'thumbnailUrl',
    cloudinaryFolder: 'cyberhub_videos',
    supportsSocial: true,
  },
  articles: {
    collection: 'articles',
    commentsCollection: 'articleComments',
    likesCollection: 'articleLikes',
    titleField: 'title',
    bodyField: 'summary',
    linkField: 'articleUrl',
    imageField: 'coverImageUrl',
    cloudinaryFolder: 'cyberhub_articles',
    supportsSocial: true,
  },
  faqs: {
    collection: 'faqs',
    titleField: 'question',
    bodyField: 'answer',
    cloudinaryFolder: null,
    supportsSocial: false,
  },
};

const getConfig = (type) => CONTENT_CONFIG[type];

const getItems = async (req, res, next) => {
  try {
    const { type } = req.params;
    const cfg = getConfig(type);
    if (!cfg) {
      res.status(400);
      throw new Error('Invalid learn content type.');
    }

    const sortField = type === 'faqs' ? 'priority' : 'createdAt';
    const sortDir = type === 'faqs' ? 'asc' : 'desc';

    let snapshot;
    try {
      snapshot = await db.collection(cfg.collection).orderBy(sortField, sortDir).get();
    } catch (err) {
      snapshot = await db.collection(cfg.collection).get();
    }

    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const { type } = req.params;
    const cfg = getConfig(type);
    if (!cfg) {
      res.status(400);
      throw new Error('Invalid learn content type.');
    }

    const baseTitle = req.body[cfg.titleField];
    const baseBody = req.body[cfg.bodyField];

    if (!baseTitle || !baseBody) {
      res.status(400);
      throw new Error(`${cfg.titleField} and ${cfg.bodyField} are required.`);
    }

    const publish = async (uploadedImageUrl = null) => {
      const payload = {
        [cfg.titleField]: baseTitle,
        [cfg.bodyField]: baseBody,
        category: req.body.category || null,
        tags: req.body.tags || null,
        level: req.body.level || null,
        authorName: req.body.authorName || 'Anonymous Creator',
        authorId: req.user?.uid || 'anonymous_user',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (cfg.linkField) payload[cfg.linkField] = req.body[cfg.linkField] || null;
      if (cfg.imageField) payload[cfg.imageField] = uploadedImageUrl || null;
      if (type === 'videos') payload.duration = req.body.duration || null;
      if (type === 'articles') payload.readTime = req.body.readTime || null;
      if (type === 'faqs') payload.priority = Number(req.body.priority || 999);

      if (cfg.supportsSocial) {
        payload.likesCount = 0;
        payload.commentsCount = 0;
      }

      const docRef = await db.collection(cfg.collection).add(payload);
      res.status(201).json({ id: docRef.id, ...payload });
    };

    if (req.file && cfg.cloudinaryFolder) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: cfg.cloudinaryFolder },
        (error, result) => {
          if (error) return next(error);
          publish(result.secure_url);
        }
      );
      uploadStream.end(req.file.buffer);
      return;
    }

    await publish(null);
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const { type, itemId } = req.params;
    const cfg = getConfig(type);
    if (!cfg || !cfg.supportsSocial) {
      res.status(400);
      throw new Error('Comments are not supported for this type.');
    }

    const snapshot = await db.collection(cfg.commentsCollection).where('itemId', '==', itemId).get();
    const comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    comments.sort((a, b) => (a.createdAt?._seconds || 0) - (b.createdAt?._seconds || 0));
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { type, itemId } = req.params;
    const cfg = getConfig(type);
    if (!cfg || !cfg.supportsSocial) {
      res.status(400);
      throw new Error('Comments are not supported for this type.');
    }

    if (!req.body.content) {
      res.status(400);
      throw new Error('Comment content is required.');
    }

    const comment = {
      itemId,
      content: req.body.content,
      authorName: req.body.authorName || 'Anonymous Operator',
      authorId: req.user?.uid || 'anonymous_user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const commentRef = await db.collection(cfg.commentsCollection).add(comment);
    await db.collection(cfg.collection).doc(itemId).update({
      commentsCount: admin.firestore.FieldValue.increment(1),
    });

    res.status(201).json({ id: commentRef.id, ...comment });
  } catch (error) {
    next(error);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const { type, itemId } = req.params;
    const cfg = getConfig(type);
    if (!cfg || !cfg.supportsSocial) {
      res.status(400);
      throw new Error('Likes are not supported for this type.');
    }

    const userId = req.user?.uid || req.body.userId || 'anonymous_user';
    const likeId = `${userId}_${itemId}`;
    const likeRef = db.collection(cfg.likesCollection).doc(likeId);
    const itemRef = db.collection(cfg.collection).doc(itemId);

    await db.runTransaction(async (t) => {
      const [itemDoc, likeDoc] = await Promise.all([t.get(itemRef), t.get(likeRef)]);
      if (!itemDoc.exists) {
        throw new Error('Item does not exist.');
      }

      const currentLikes = itemDoc.data().likesCount || 0;
      if (likeDoc.exists) {
        t.delete(likeRef);
        t.update(itemRef, { likesCount: Math.max(0, currentLikes - 1) });
      } else {
        t.set(likeRef, {
          itemId,
          userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        t.update(itemRef, { likesCount: currentLikes + 1 });
      }
    });

    res.status(200).json({ message: 'Like toggled successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  createItem,
  getComments,
  addComment,
  toggleLike,
};

