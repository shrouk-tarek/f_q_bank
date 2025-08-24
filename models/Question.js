const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true
  },
  chapterId: { // استخدمي الـ id بدل الاسم
    type: mongoose.Schema.ObjectId,
    ref: 'Chapter',
    required: true
  },
  level: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Please add a difficulty level']
  },
  type: {
    type: String,
    enum: ['true_false', 'mcq', 'open_text', 'complete'],
    required: [true, 'Please add a question type']
  },
 questionText: {
    type: String,
    required: function () {
      return this.type === 'open_text';
    }
  },
  questionImage: {
    type: String
  },
  image: {
    type: String, // URL or file path
    required: false,
  },
  options: {
    type: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    required: function () {
      return this.type === 'mcq';
    },
  },
  correctAnswer: {
    type: String,
    required: function() {
      return this.type !== 'open_text';
    }
  },
   answerImage: {
    type: String,
    required: false
  },
  youtubeLink: {
    type: String,
    required: false
  },
  modelAnswer: {
    type: String,
    required: function() {
      return this.type === 'open_text';
    }
  },
  points: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
