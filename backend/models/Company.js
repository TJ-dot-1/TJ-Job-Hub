// models/Company.js
import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: String,
  tagline: String,
  description: String,
  industry: String,
  website: String,
  email: String,
  phone: String,
  headquarters: String,
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  foundedYear: Number,
  mission: String,
  culture: String,
  techStack: [String],
  socialMedia: {
    linkedin: String,
    twitter: String,
    github: String
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema);