const express = require('express');
const questionController = require('../controllers/questionController');
const { protect, adminOnly } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', protect, questionController.getQuestions);
router.post(
  '/',
  protect,
  adminOnly,
  upload.fields([
    { name: 'image', maxCount: 1 },        // Question image
    { name: 'answerImage', maxCount: 1 }   // Answer image
  ]),
  questionController.createQuestion
);

router.get('/:id', protect, questionController.getQuestion);
router.delete('/:id', protect, adminOnly, questionController.deleteQuestion);

router.post('/select', protect, questionController.getQuestionsByChaptersAndLevels);
router.post('/batch', protect, questionController.getQuestionsBatch);
router.get('/chapter/:chapterId', protect, questionController.getQuestionsByChapter);
module.exports = router;
