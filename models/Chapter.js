const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a chapter name'],
  },
  subjectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chapter', ChapterSchema);
