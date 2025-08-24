const express = require('express');
const { getSubjects, createSubject, addChapter, deleteChapter, deleteSubject, getChaptersBySubject, getSubjectsWithChapters } = require('../controllers/subjectController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(getSubjects)
  .post(protect, adminOnly, createSubject);

router.route('/with-chapters')
  .get(protect, getSubjectsWithChapters);

router.route('/:subjectId/chapters')
  .get(getChaptersBySubject)
  .post(protect, adminOnly, addChapter);

router.route('/:subjectId/chapters/:chapterId')
  .delete(protect, adminOnly, deleteChapter);

router.route('/:subjectId')
  .delete(protect, adminOnly, deleteSubject);

module.exports = router;
