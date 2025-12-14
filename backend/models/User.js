import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['job_seeker', 'employer', 'admin'],
    required: true
  },
  profile: {
    headline: String,
    bio: String,
    avatar: String,
    coverPhoto: String,
    location: {
      city: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    phone: String,
    website: String,
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      portfolio: String
    },
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      verified: Boolean
    }],
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String,
      skills: [String]
    }],
    education: [{
      degree: String,
      institution: String,
      field: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String,
      url: String
    }],
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native']
      }
    }],
    resume: String,
    resumePreview: String,
    videoIntroduction: String,
    salaryExpectation: {
      min: Number,
      max: Number,
      currency: String
    },
    preferredJobTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote']
    }],
    availability: {
      type: String,
      enum: ['immediately', '2 weeks', '1 month', '3 months', 'custom']
    }
  },
  company: {
    name: String,
    logo: String,
    website: String,
    description: String,
    size: String,
    industry: String,
    founded: Number,
    headquarters: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      },
      resumeVisibility: {
        type: String,
        enum: ['public', 'employers', 'private'],
        default: 'employers'
      }
    },
    jobAlerts: [{
      title: String,
      location: String,
      category: String,
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      }
    }]
  },
  stats: {
    profileCompleteness: { type: Number, default: 0 },
    applicationsSent: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    searchAppearances: { type: Number, default: 0 },
    jobsPosted: { type: Number, default: 0 },
    totalApplications: { type: Number, default: 0 },
    hiredCount: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    expiresAt: Date,
    monthlyUsage: {
      applications: { type: Number, default: 0 },
      adviceViews: { type: Number, default: 0 },
      jobPostings: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now }
    },
    features: {
      featuredJobs: { type: Boolean, default: false },
      aiMatching: { type: Boolean, default: true },
      advancedAnalytics: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false }
    }
  },
  bettingProfile: {
    balance: { type: Number, default: 0 },
    totalBets: { type: Number, default: 0 },
    totalWinnings: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    isBettingEnabled: { type: Boolean, default: true },
    kycVerified: { type: Boolean, default: false },
    depositLimit: { type: Number, default: 1000 },
    lossLimit: { type: Number, default: 500 },
    sessionTimeLimit: { type: Number, default: 3600 }, // seconds
    lastDeposit: { type: Date },
    lastBet: { type: Date },
    sessionStart: { type: Date }
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'profile.skills.name': 1 });
userSchema.index({ 'profile.location.coordinates': '2dsphere' });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    try {
      this.password = await bcrypt.hash(this.password, 12);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw error;
    }
  }
  this.updatedAt = Date.now();
  next();
});

// Method to check password
userSchema.methods.checkPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

// Method to calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function() {
  let completeness = 0;
  const fields = [
    this.name && 10,
    this.email && 10,
    this.profile?.headline && 10,
    this.profile?.bio && 10,
    this.profile?.skills?.length > 0 && 15,
    this.profile?.experience?.length > 0 && 15,
    this.profile?.education?.length > 0 && 10,
    this.profile?.resume && 10,
    this.profile?.avatar && 10
  ].filter(Boolean);

  completeness = fields.reduce((sum, weight) => sum + weight, 0);
  this.stats.profileCompleteness = Math.min(completeness, 100);
  return this.stats.profileCompleteness;
};

// Method to check if user can perform action based on subscription
userSchema.methods.canPerformAction = function(action) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const lastResetMonth = this.subscription.monthlyUsage.lastReset.getMonth();

  // Reset counters if it's a new month
  if (currentMonth !== lastResetMonth) {
    this.subscription.monthlyUsage.applications = 0;
    this.subscription.monthlyUsage.adviceViews = 0;
    this.subscription.monthlyUsage.jobPostings = 0;
    this.subscription.monthlyUsage.lastReset = now;
  }

  // Check if subscription is active
  if (this.subscription.plan === 'pro' && (!this.subscription.expiresAt || this.subscription.expiresAt > now)) {
    return { allowed: true };
  }

  // Free tier limits
  const limits = {
    job_seeker: {
      applications: 5,
      adviceViews: 2
    },
    employer: {
      jobPostings: 3
    }
  };

  const userLimits = limits[this.role];
  if (!userLimits) return { allowed: false, reason: 'Invalid user role' };

  switch (action) {
    case 'apply':
      if (this.subscription.monthlyUsage.applications >= userLimits.applications) {
        return { allowed: false, reason: `Monthly application limit (${userLimits.applications}) reached` };
      }
      break;
    case 'view_advice':
      if (this.subscription.monthlyUsage.adviceViews >= userLimits.adviceViews) {
        return { allowed: false, reason: `Monthly advice view limit (${userLimits.adviceViews}) reached` };
      }
      break;
    case 'post_job':
      if (this.subscription.monthlyUsage.jobPostings >= userLimits.jobPostings) {
        return { allowed: false, reason: `Monthly job posting limit (${userLimits.jobPostings}) reached` };
      }
      break;
    default:
      return { allowed: false, reason: 'Unknown action' };
  }

  return { allowed: true };
};

// Method to increment usage counter
userSchema.methods.incrementUsage = function(action) {
  switch (action) {
    case 'apply':
      this.subscription.monthlyUsage.applications += 1;
      break;
    case 'view_advice':
      this.subscription.monthlyUsage.adviceViews += 1;
      break;
    case 'post_job':
      this.subscription.monthlyUsage.jobPostings += 1;
      break;
  }
  return this.save();
};

export default mongoose.model('User', userSchema);