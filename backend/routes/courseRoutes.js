const express = require('express');
const multer = require('multer');
const {
  getCourses,
  createCourse,
  getCourseComments,
  addCourseComment,
  toggleCourseLike,
} = require('../controllers/courseController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getCourses);
router.post('/', upload.single('thumbnail'), createCourse);
router.get('/:courseId/comments', getCourseComments);
router.post('/:courseId/comments', addCourseComment);
router.post('/:courseId/like', toggleCourseLike);

module.exports = router;

