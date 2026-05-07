const { db, admin } = require('../config/firebase');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getCourses = async (req, res, next) => {
  try {
    const snapshot = await db.collection('courses').orderBy('createdAt', 'desc').get();
    const courses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, courseUrl, authorName } = req.body;
    if (!title || !description) {
      res.status(400);
      throw new Error('Title and description are required.');
    }

    const saveCourseToDb = async (thumbnailUrl) => {
      const course = {
        title,
        description,
        category: category || null,
        courseUrl: courseUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        authorName: authorName || 'Anonymous Educator',
        authorId: req.user?.uid || 'anonymous_user',
        likesCount: 0,
        commentsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const ref = await db.collection('courses').add(course);
      res.status(201).json({ id: ref.id, ...course });
    };

    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'cyberhub_courses' },
        (error, result) => {
          if (error) return next(error);
          saveCourseToDb(result.secure_url);
        }
      );
      uploadStream.end(req.file.buffer);
      return;
    }

    await saveCourseToDb(null);
  } catch (error) {
    next(error);
  }
};

const getCourseComments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const snapshot = await db.collection('courseComments').where('courseId', '==', courseId).get();
    const comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    comments.sort((a, b) => {
      const aTime = a.createdAt?._seconds || 0;
      const bTime = b.createdAt?._seconds || 0;
      return aTime - bTime;
    });

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

const addCourseComment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { content, authorName } = req.body;

    if (!content) {
      res.status(400);
      throw new Error('Comment content is required.');
    }

    const comment = {
      courseId,
      content,
      authorName: authorName || 'Anonymous Operator',
      authorId: req.user?.uid || 'anonymous_user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const commentRef = await db.collection('courseComments').add(comment);
    await db.collection('courses').doc(courseId).update({
      commentsCount: admin.firestore.FieldValue.increment(1),
    });

    res.status(201).json({ id: commentRef.id, ...comment });
  } catch (error) {
    next(error);
  }
};

const toggleCourseLike = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.uid || req.body.userId || 'anonymous_user';
    const likeId = `${userId}_${courseId}`;
    const likeRef = db.collection('courseLikes').doc(likeId);
    const courseRef = db.collection('courses').doc(courseId);

    await db.runTransaction(async (t) => {
      const [courseDoc, likeDoc] = await Promise.all([t.get(courseRef), t.get(likeRef)]);
      if (!courseDoc.exists) {
        throw new Error('Course does not exist.');
      }

      const currentLikes = courseDoc.data().likesCount || 0;
      if (likeDoc.exists) {
        t.delete(likeRef);
        t.update(courseRef, { likesCount: Math.max(0, currentLikes - 1) });
      } else {
        t.set(likeRef, {
          courseId,
          userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        t.update(courseRef, { likesCount: currentLikes + 1 });
      }
    });

    res.status(200).json({ message: 'Course like toggled successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  createCourse,
  getCourseComments,
  addCourseComment,
  toggleCourseLike,
};

