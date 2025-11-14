import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  resume: {
    url: String,
    name: String,
    size: Number,
    previewUrl: String
  },
  answers: [{
    question: String,
    answer: String,
    required: Boolean
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'shortlisted', 'interview', 'rejected', 'accepted', 'withdrawn'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  notes: String,
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ratedAt: Date
  },
  interview: {
    scheduledAt: Date,
    duration: Number,
    type: {
      type: String,
      enum: ['phone', 'video', 'in_person']
    },
    meetingLink: String,
    notes: String,
    feedback: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ job: 1, user: 1 }, { unique: true });
applicationSchema.index({ user: 1, appliedAt: -1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ status: 1 });

// Pre-save middleware
applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Add to status history if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  
  next();
});

// Static method to get application stats
applicationSchema.statics.getStats = async function(userId, role) {
  if (role === 'job_seeker') {
    return this.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  } else {
    // For employers, get stats for their jobs
    const Job = mongoose.model('Job');
    const jobIds = await Job.find({ company: userId }).distinct('_id');

    return this.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }
};

// Static method to find applications by employer
applicationSchema.statics.findByEmployer = async function(employerId, options = {}) {
  const { jobId, status, page = 1, limit = 10 } = options;

  // Get employer's job IDs
  const Job = mongoose.model('Job');
  const jobIds = await Job.find({ company: employerId }).distinct('_id');

  let query = { job: { $in: jobIds } };
  if (jobId) query.job = jobId;
  if (status) query.status = status;

  const applications = await this.find(query)
    .populate('job', 'title company location')
    .populate('user', 'name profile.avatar profile.headline profile.skills profile.experience profile.education email')
    .sort({ appliedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  return applications;
};

export default mongoose.model('Application', applicationSchema);