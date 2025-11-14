import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous feedback
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['general', 'bug', 'feature', 'ui', 'performance', 'other'],
    default: 'general'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  reviewedAt: {
    type: Date,
    required: false
  },
  response: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'responded', 'closed', 'approved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for performance
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ isReviewed: 1 });
feedbackSchema.index({ category: 1 });

// Virtual for time since creation
feedbackSchema.virtual('timeSince').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
});

// Method to mark as reviewed
feedbackSchema.methods.markAsReviewed = function(adminId, response = null) {
  this.isReviewed = true;
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  if (response) {
    this.response = response;
    this.status = 'responded';
  } else {
    this.status = 'reviewed';
  }
  return this.save();
};

export default mongoose.model('Feedback', feedbackSchema);