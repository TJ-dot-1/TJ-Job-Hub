import mongoose from 'mongoose';

const employerProfileSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String, // ImageKit URL
    default: null
  },
  about: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL starting with http:// or https://'
    }
  },
  industry: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  foundedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
employerProfileSchema.index({ employerId: 1 });
employerProfileSchema.index({ companyName: 1 });
employerProfileSchema.index({ industry: 1 });
employerProfileSchema.index({ isVerified: 1 });

// Pre-save middleware
employerProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if profile is complete
employerProfileSchema.methods.isProfileComplete = function() {
  const requiredFields = ['companyName', 'about', 'industry', 'location'];
  return requiredFields.every(field => this[field] && this[field].toString().trim().length > 0);
};

// Method to get public profile data (safe for job seekers)
employerProfileSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    companyName: this.companyName,
    logo: this.logo,
    about: this.about,
    website: this.website,
    industry: this.industry,
    location: this.location,
    companySize: this.companySize,
    foundedYear: this.foundedYear,
    socialLinks: this.socialLinks,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

export default mongoose.model('EmployerProfile', employerProfileSchema);