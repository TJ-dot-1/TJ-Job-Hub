import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  // Drop any existing unique index on seo.slug when model is initialized
  seo: {
    slug: { type: String, index: false }, // Explicitly disable indexing
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },

  // Company Information
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Company is required'],
    index: true
  },
  companyDetails: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: String,
    website: String,
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    description: String
  },

  // Basic Job Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  shortDescription: String,

  // Job Classification
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'technology', 'healthcare', 'finance', 'education', 'marketing',
      'sales', 'design', 'engineering', 'operations', 'hr',
      'customer-service', 'legal', 'real-estate', 'manufacturing',
      'retail', 'hospitality', 'transportation', 'other'
    ],
    index: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],

  // Employment Details
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary'],
    index: true
  },
  employmentLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    index: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'US'
    },
    zipCode: String
  },
  
  remotePolicy: {
    type: String,
    enum: ['remote', 'hybrid', 'on-site'],
    default: 'on-site',
    index: true
  },

  // Salary Information
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },

  // Requirements & Qualifications
  requirements: {
    experience: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      }
    },
    skills: [{
      name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      }
    }],
    education: [{
      type: String,
      trim: true
    }],
    certifications: [{
      type: String,
      trim: true
    }],
    languages: [{
      type: String,
      trim: true
    }]
  },

  // Application Process
  applicationProcess: {
    questions: [{
      question: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['text', 'multiple-choice', 'file', 'code', 'video'],
        default: 'text'
      },
      options: [String],
      required: {
        type: Boolean,
        default: false
      }
    }],
    requiresCoverLetter: {
      type: Boolean,
      default: false
    },
    requiresResume: {
      type: Boolean,
      default: true
    },
    applicationDeadline: Date
  },

  // Job Metadata & Analytics
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },

  // SEO & Discoverability
  seo: {
    slug: { type: String, index: false },
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },

  // Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired', 'archived'],
    default: 'draft',
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Dates & Timelines
  postedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  applicationDeadline: Date,

  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound Indexes for Performance (removed seo.slug unique index)
jobSchema.index({ category: 1, jobType: 1, location: 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ 'requirements.skills.name': 1 });
jobSchema.index({ status: 1, expiresAt: 1 });
jobSchema.index({ isFeatured: -1, postedAt: -1 });
jobSchema.index({ company: 1, status: 1 });

// Virtual Fields
jobSchema.virtual('isActive').get(function() {
  return this.status === 'active' && 
         (!this.expiresAt || this.expiresAt > new Date());
});

jobSchema.virtual('salaryRange').get(function() {
  if (!this.salary.min && !this.salary.max) return null;
  if (this.salary.min && this.salary.max) {
    return `${this.salary.currency} ${this.salary.min} - ${this.salary.max} per ${this.salary.period}`;
  }
  if (this.salary.min) {
    return `${this.salary.currency} ${this.salary.min}+ per ${this.salary.period}`;
  }
  return `Up to ${this.salary.currency} ${this.salary.max} per ${this.salary.period}`;
});

// Pre-save Middleware
jobSchema.pre('save', async function(next) {
  this.updatedAt = new Date();

  // Auto-generate short description if not provided
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 197) + '...';
  }

  // Set expiry date if not set (default: 30 days from posting)
  if (!this.expiresAt && this.status === 'active') {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  next();
});

// Static Methods
jobSchema.statics.findActiveJobs = function(filters = {}) {
  const query = { 
    status: 'active',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  if (filters.category) query.category = filters.category;
  if (filters.jobType) query.jobType = filters.jobType;
  if (filters.location) query.location = new RegExp(filters.location, 'i');
  if (filters.remotePolicy) query.remotePolicy = filters.remotePolicy;
  if (filters.skills) {
    query['requirements.skills.name'] = { $in: filters.skills.map(s => s.toLowerCase()) };
  }
  
  return this.find(query)
    .populate('company', 'name email company.logo')
    .sort({ isFeatured: -1, postedAt: -1 });
};

jobSchema.statics.findByEmployer = function(employerId, filters = {}) {
  const { status, page = 1, limit = 10, sortBy = '-postedAt' } = filters;
  
  const query = { company: employerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('company', 'name company.logo')
    .sort(sortBy)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Instance Methods
jobSchema.methods.incrementViews = function() {
  this.metadata.views += 1;
  this.metadata.lastViewed = new Date();
  return this.save();
};

jobSchema.methods.incrementApplications = function() {
  this.metadata.applications += 1;
  return this.save();
};

export default mongoose.model('Job', jobSchema);