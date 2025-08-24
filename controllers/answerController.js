const Question = require('../models/Question');
const StudentAnswer = require('../models/StudentAnswer');
const ErrorResponse = require('../utils/errorHandler');
const { evaluateOpenEndedAnswer } = require('../config/gemini');

// @desc    Submit answer
// @route   POST /api/answers
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;
    const studentId = req.user.id;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return next(new ErrorResponse('Question not found', 404));
    }

    let isCorrect = false;
    let feedback = '';
    let score = 0;

    // Evaluate answer based on question type
    if (question.type === 'open_text') {
      // Use Gemini API for open-ended questions
      const evaluation = await evaluateOpenEndedAnswer(question.modelAnswer, answer);
      isCorrect = evaluation.isCorrect;
      feedback = evaluation.feedback;
      score = isCorrect ? question.points : 0;
    } else {
      // For other types, compare with correctAnswer
      isCorrect = answer === question.correctAnswer;
      feedback = isCorrect ? 'Correct answer!' : 'Incorrect answer';
      score = isCorrect ? question.points : 0;
    }

    // Check if the student has already answered this question
    let studentAnswer = await StudentAnswer.findOne({ studentId, questionId });

    if (studentAnswer) {
      // Update the existing answer
      studentAnswer.answer = answer;
      studentAnswer.isCorrect = isCorrect;
      studentAnswer.feedback = feedback;
      studentAnswer.score = score;
      await studentAnswer.save();
    } else {
      // Create a new answer
      studentAnswer = await StudentAnswer.create({
        studentId,
        questionId,
        answer,
        isCorrect,
        feedback,
        score
      });
    }

    res.status(201).json({
      success: true,
      data: {
        isCorrect,
        feedback,
        score
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit many answers at once
// @route   POST /api/answers/batch
// @access  Private
exports.submitManyAnswers = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const answersArray = req.body.answers; // [{ questionId, answer }, ...]

    if (!Array.isArray(answersArray) || answersArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Answers array is required and cannot be empty',
      });
    }

    const results = [];

    for (const item of answersArray) {
      const { questionId, answer } = item;
      // Check if question exists
      const question = await Question.findById(questionId);
      if (!question) {
        results.push({
          questionId,
          error: 'Question not found'
        });
        continue;
      }

      let isCorrect = false;
      let feedback = '';
      let score = 0;

      if (question.type === 'open_text') {
        const evaluation = await evaluateOpenEndedAnswer(question.modelAnswer, answer);
        isCorrect = evaluation.isCorrect;
        feedback = evaluation.feedback;
        score = isCorrect ? question.points : 0;
      } else {
        isCorrect = answer === question.correctAnswer;
        feedback = isCorrect ? 'Correct answer!' : 'Incorrect answer';
        score = isCorrect ? question.points : 0;
      }

      let studentAnswer = await StudentAnswer.findOne({ studentId, questionId });

      if (studentAnswer) {
        studentAnswer.answer = answer;
        studentAnswer.isCorrect = isCorrect;
        studentAnswer.feedback = feedback;
        studentAnswer.score = score;
        await studentAnswer.save();
      } else {
        studentAnswer = await StudentAnswer.create({
          studentId,
          questionId,
          answer,
          isCorrect,
          feedback,
          score
        });
      }

      results.push({
        questionId,
        isCorrect,
        feedback,
        score
      });
    }

    res.status(201).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's answer history
// @route   GET /api/answers
// @access  Private
exports.getAnswerHistory = async (req, res, next) => {
  try {
    const answers = await StudentAnswer.find({ studentId: req.user.id })
      .populate({
        path: 'questionId',
        select: 'questionText type subjectId chapter level'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: answers.length,
      data: answers
    });
  } catch (err) {
    next(err);
  }
};
