import mongoose from 'mongoose';

const cvRequestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  jobRole: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  serviceType: {
    type: String,
    enum: ['revamp', 'new'],
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  package: {
    type: String,
    enum: ['basic', 'professional', 'executive'],
    default: 'basic'
  },
  cvFile: {
    url: String,
    fileId: String,
    fileName: String
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  whatsappNumber: {
    type: String,
    default: process.env.WHATSAPP_NUMBER || '+1234567890'
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

// Update the updatedAt field before saving
cvRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const CvRequest = mongoose.model('CvRequest', cvRequestSchema);

export default CvRequest;