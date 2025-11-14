// models/Assessment.js
import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Programming', 'Frontend', 'Backend', 'Data Science', 'Design', 'Computer Science', 'DevOps', 'Mobile', 'Database', 'Cloud']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number, // index of correct option
      required: true
    },
    explanation: String
  }],
  skills: [{
    type: String,
    required: true
  }],
  passingScore: {
    type: Number,
    default: 70, // percentage
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for question count
assessmentSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Index for search
assessmentSchema.index({ title: 'text', description: 'text', skills: 'text' });

export default mongoose.model('Assessment', assessmentSchema);