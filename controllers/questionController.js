const mongoose = require('mongoose');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const cloudinary = require('cloudinary').v2;
const ErrorResponse = require('../utils/errorHandler');
const StudentAnswer = require('../models/StudentAnswer');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res, next) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'status', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit parameter. It must be a positive number.',
      });
    }

    let questions = await Question.find(reqQuery);

    if (req.query.status) {
      const answers = await StudentAnswer.find({ studentId: req.user.id });

      if (req.query.status === 'wrong') {
        const wrongAnswers = answers.filter(answer => !answer.isCorrect);
        const wrongQuestionIds = new Set(wrongAnswers.map(answer => answer.questionId.toString()));
        questions = questions.filter(question => wrongQuestionIds.has(question._id.toString()));
      } else if (req.query.status === 'not answered') {
        const answeredQuestionIds = new Set(answers.map(answer => answer.questionId.toString()));
        questions = questions.filter(question => !answeredQuestionIds.has(question._id.toString()));
      }
    }

    const limitedQuestions = questions.slice(0, limit);

    res.status(200).json({
      success: true,
      count: limitedQuestions.length,
      data: limitedQuestions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private
const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid question ID format'
      });
    }

    const question = await Question.findById(id).populate('chapterId');

    if (!question) {
      return res.status(404).json({
        success: false,
        error: `Question not found with id of ${id}`
      });
    }

    if (req.user.role !== 'admin') {
      question.correctAnswer = undefined;
      question.modelAnswer = undefined;
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// @desc    Create new question with image, answer image, and youtube link
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res, next) => {
  try {
    const { questionText, type, options, correctAnswer, modelAnswer, points, chapterId, subjectId, level, youtubeLink } = req.body;

    if (options && typeof options === 'string') {
      req.body.options = JSON.parse(options);
    }

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: 'Subject ID is required',
      });
    }

    if (!level) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty level is required',
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found',
      });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(400).json({
        success: false,
        error: `Chapter not found`,
      });
    }

    const questionData = {
      questionText,
      type,
      options: req.body.options,
      correctAnswer,
      modelAnswer,
      points,
      chapterId,
      subjectId,
      level,
      youtubeLink,
    };

    // Upload question image to Cloudinary if provided
    if (req.files && req.files.image && req.files.image[0]) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: 'questions',
        resource_type: 'image',
      });
      questionData.image = result.secure_url;
    }

    // Upload answer image to Cloudinary if provided
    if (req.files && req.files.answerImage && req.files.answerImage[0]) {
      const result = await cloudinary.uploader.upload(req.files.answerImage[0].path, {
        folder: 'answers',
        resource_type: 'image',
      });
      questionData.answerImage = result.secure_url;
    }

    const question = await Question.create(questionData);

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: `Question not found with id of ${req.params.id}`
      });
    }

    await StudentAnswer.deleteMany({ questionId: question._id });
    await question.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// @desc    Get questions by multiple chapters and levels with count, subject, and type
// @route   POST /api/questions/select
// @access  Private
const getQuestionsByChaptersAndLevels = async (req, res, next) => {
  try {
    let { chapters, subject, type } = req.body;
    // If chapters array is not sent or is empty, fetch all chapters
    if (!Array.isArray(chapters) || chapters.length === 0) {
      // Fetch all chapters from the database
      const allChapters = await Chapter.find(subject ? { subjectId: subject } : {});
      // Prepare chapters array automatically
      chapters = allChapters.map(chap => ({
        chapterId: chap._id,
        level: req.body.level || 'easy', // You can customize level from request or use default
        type: type || 'mcq', // You can customize type from request or use default
        count: req.body.count || 1 // You can customize count from request or use default
      }));
    }

    let allQuestions = [];
    let seenIds = new Set();

    for (const item of chapters) {
      const { chapterId, level, type, count } = item;
      if (!chapterId || !level || !type || !count || count <= 0) continue;

      let query = { chapterId: chapterId, level: level, type: type };
      if (subject) query.subjectId = subject;

      const questions = await Question.find(query).limit(count);
      for (const q of questions) {
        if (!seenIds.has(q._id.toString())) {
          allQuestions.push(q);
          seenIds.add(q._id.toString());
        }
      }
    }

    res.status(200).json({
      success: true,
      count: allQuestions.length,
      data: allQuestions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get questions by batch requests (each with its own filters)
// @route   POST /api/questions/batch
// @access  Private
const getQuestionsBatch = async (req, res, next) => {
  try {
    const { requests, subject } = req.body; // requests: array of { chapterId, questionType, difficulty, count }
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ success: false, error: 'Requests array is required' });
    }

    let allQuestions = [];

    for (const item of requests) {
      const { chapterId, questionType, difficulty, count } = item;
      // Check for required values in each request
      if (!chapterId || !questionType || !difficulty || !count || count <= 0) continue;

      // Build query for this batch
      let query = {
        chapterId: chapterId,
        type: questionType,
        level: difficulty
      };
      // Keep any global filters (like subject)
      if (subject) query.subjectId = subject;

      // Fetch questions matching the filters, limit by count
      const questions = await Question.find(query).limit(count);
      allQuestions = allQuestions.concat(questions);
    }

    res.status(200).json({
      success: true,
      count: allQuestions.length,
      data: allQuestions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all questions for a chapter
// @route   GET /api/questions/chapter/:chapterId
// @access  Private
const getQuestionsByChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({ success: false, error: 'Invalid chapter ID format' });
    }
    const questions = await Question.find({ chapterId });
    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  deleteQuestion,
  getQuestionsByChaptersAndLevels,
  getQuestionsBatch,
  getQuestionsByChapter
};