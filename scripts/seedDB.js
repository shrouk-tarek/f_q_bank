require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Question = require('../models/Question');
const StudentAnswer = require('../models/StudentAnswer');
const bcrypt = require('bcryptjs');

// Connect to DB
connectDB();

// Clear existing data
const clearDatabase = async () => {
  await User.deleteMany();
  await Subject.deleteMany();
  await Chapter.deleteMany();
  await Question.deleteMany();
  await StudentAnswer.deleteMany();
  console.log('Database cleared');
};

// Seed data
const seedDatabase = async () => {
  try {
    // Create admin user
    const admin = await User.create({
      email: 'tarekshrouk511@gmail.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create student user
    const student = await User.create({
      email: 'student@questionbank.com',
      password: 'student123',
      role: 'student'
    });

    // Create subjects
    const subjects = await Subject.insertMany([
      { name: 'Mathematics' },
      { name: 'Physics' },
      { name: 'Chemistry' },
    ]);

    console.log('Subjects created.');

    // Create chapters for each subject
    const chapters = [];
    for (const subject of subjects) {
      const subjectChapters = await Chapter.insertMany([
        { name: 'Algebra', subjectId: subject._id },
        { name: 'Geometry', subjectId: subject._id },
        { name: 'Calculus', subjectId: subject._id },
      ]);
      chapters.push(...subjectChapters);
    }

    console.log('Chapters created.');

    // Example subject created earlier
    const exampleSubject = await Subject.findOne(); // Ensure a subject exists

    // Example chapter created earlier
    const exampleChapter = chapters[0]; // Use the first chapter as an example

    // Insert questions and retrieve their IDs
    const insertedQuestions = await Question.insertMany([
      {
        questionText: "What is 2 + 2?",
        level: "easy",
        chapterId: exampleChapter._id,
        subjectId: exampleSubject._id,
        chapter: exampleChapter.name,
        type: "mcq",
        options: [
          { text: "3", isCorrect: false },
          { text: "4", isCorrect: true },
          { text: "5", isCorrect: false },
        ],
        correctAnswer: "4",
      },
      {
        questionText: "What is the capital of France?",
        level: "medium",
        chapterId: exampleChapter._id,
        subjectId: exampleSubject._id,
        chapter: exampleChapter.name,
        type: "mcq",
        options: [
          { text: "Berlin", isCorrect: false },
          { text: "Paris", isCorrect: true },
          { text: "Madrid", isCorrect: false },
        ],
        correctAnswer: "Paris",
      },
    ]);

    console.log("Questions created.");

    // Create some student answers using the inserted question IDs
    await StudentAnswer.create([
      {
        studentId: student._id,
        questionId: insertedQuestions[0]._id, // Use the first question's ID
        answer: "4",
        isCorrect: true,
        feedback: "Correct answer!",
        score: 1,
      },
      {
        studentId: student._id,
        questionId: insertedQuestions[1]._id, // Use the second question's ID
        answer: "Berlin",
        isCorrect: false,
        feedback: "Incorrect answer. The correct answer is Paris.",
        score: 0,
      },
    ]);

    console.log("Student answers created.");
    console.log("Database seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

// Run the seed
const runSeed = async () => {
  await clearDatabase();
  await seedDatabase();
};

runSeed();
