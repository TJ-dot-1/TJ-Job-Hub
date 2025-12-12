import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { subscriptionGuard } from '../middleware/subscription.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
const router = express.Router();

// Apply for a job
router.post('/', verifyToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const { jobId, coverLetter, answers } = req.body;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if job exists and is active
    const job = await Job.findOne({
      _id: jobId,
      status: 'active',
      $or: [
        { deadline: { $gte: new Date() } },
        { deadline: null }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or expired'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      user: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Check if job requires resume and user has one
    if (job.applicationProcess?.requiresResume && !req.user.profile?.resume) {
      return res.status(400).json({
        success: false,
        message: 'This job requires a resume. Please upload your resume to your profile before applying.'
      });
    }

    // Check subscription limits
    const permission = req.user.canPerformAction('apply');
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: 'Subscription limit reached',
        reason: permission.reason,
        upgradeRequired: true,
        pricingUrl: '/pricing'
      });
    }

    // Create application
    const application = new Application({
      job: jobId,
      user: req.user._id,
      coverLetter,
      answers,
      resume: req.user.profile?.resume ? {
        url: req.user.profile.resume,
        name: 'resume.pdf',
        size: 0,
        previewUrl: req.user.profile.resumePreview
      } : undefined
    });

    await application.save();
    
    // Populate application data
    await application.populate('job', 'title company');
    await application.populate('user', 'name profile.avatar profile.headline');

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { 'metadata.applications': 1 }
    });

    // Increment usage counter after successful application
    await req.user.incrementUsage('apply');

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.applicationsSent': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application'
    });
  }
});

// Get user's applications
router.get('/my-applications', verifyToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { user: req.user._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('job', 'title company location salary jobType remotePolicy metadata.views')
      .populate('user', 'name profile.avatar')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// Get applications for employer's jobs
router.get('/employer/applications', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const { page = 1, limit = 10, jobId, status } = req.query;
    
    // Get employer's job IDs
    const jobIds = await Job.find({ company: req.user._id }).distinct('_id');
    
    let query = { job: { $in: jobIds } };
    if (jobId) query.job = jobId;
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('job', 'title company location')
      .populate('user', 'name profile.avatar profile.headline profile.skills profile.experience profile.education')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// Update application status
router.put('/:id/status', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const { status, note } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if employer owns the job
    if (application.job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    application.status = status;
    if (note) {
      application.notes = note;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application'
    });
  }
});

// Get application statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const stats = await Application.getStats(req.user.id, req.user.role);
    
    const statsObject = {
      pending: 0,
      under_review: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0,
      accepted: 0
    };

    stats.forEach(stat => {
      statsObject[stat._id] = stat.count;
    });

    res.json({
      success: true,
      stats: statsObject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application stats'
    });
  }
});

export default router;