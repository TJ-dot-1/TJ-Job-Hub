import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Feedback from '../models/Feedback.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
const requireAdmin = requireRole(['admin']);

// Analytics Overview
router.get('/analytics/overview', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalJobSeekers,
      totalEmployers,
      totalJobs,
      totalApplications,
      activeSubscriptions,
      recentFeedback
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'job_seeker', isActive: true }),
      User.countDocuments({ role: 'employer', isActive: true }),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      User.countDocuments({
        'subscription.plan': 'pro',
        $or: [
          { 'subscription.expiresAt': { $exists: false } },
          { 'subscription.expiresAt': { $gt: new Date() } }
        ]
      }),
      Feedback.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobSeekers,
        totalEmployers,
        totalJobs,
        totalApplications,
        activeSubscriptions,
        recentFeedback
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// Users Management
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      plan,
      isActive,
      sortBy = '-createdAt'
    } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (plan) filter['subscription.plan'] = plan;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('company', 'name');

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Update user (ban/unban, upgrade/downgrade plan)
router.put('/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { isActive, subscription } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update active status
    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    // Update subscription plan
    if (subscription) {
      // Ensure we have a complete subscription object
      const currentSubscription = user.subscription || {};
      user.subscription = {
        plan: subscription.plan || currentSubscription.plan || 'free',
        monthlyUsage: (subscription.monthlyUsage !== undefined ? subscription.monthlyUsage : currentSubscription.monthlyUsage) || {
          applications: 0,
          adviceViews: 0,
          jobPostings: 0,
          lastReset: new Date()
        },
        features: (subscription.features !== undefined ? subscription.features : currentSubscription.features) || {
          featuredJobs: false,
          aiMatching: true,
          advancedAnalytics: false,
          prioritySupport: false
        },
        ...(subscription.expiresAt && { expiresAt: subscription.expiresAt }),
        ...(subscription.interval && { interval: subscription.interval })
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Jobs Management
router.get('/jobs', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category,
      company,
      sortBy = '-postedAt'
    } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'companyDetails.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (company) filter['companyDetails.name'] = { $regex: company, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('company', 'name email')
      .populate('createdBy', 'name email')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin jobs fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

// Update job
router.put('/jobs/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('company', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Admin job update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
});

// Delete job
router.delete('/jobs/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Admin job delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
});

// Feedback Management
router.get('/feedback', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      isReviewed,
      sortBy = '-createdAt'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (isReviewed !== undefined) filter.isReviewed = isReviewed === 'true';

    const feedback = await Feedback.find(filter)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(filter);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin feedback fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
});

// Update feedback (mark as reviewed/approved)
router.put('/feedback/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, response, isReviewed } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    if (status) feedback.status = status;
    if (response) feedback.response = response;
    if (isReviewed !== undefined) {
      feedback.isReviewed = isReviewed;
      if (isReviewed) {
        feedback.reviewedBy = req.userId;
        feedback.reviewedAt = new Date();
      }
    }

    await feedback.save();
    await feedback.populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Admin feedback update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback'
    });
  }
});

// Approve feedback for display
router.put('/feedback/:id/approve', verifyToken, requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.status = 'approved';
    feedback.isReviewed = true;
    feedback.reviewedBy = req.userId;
    feedback.reviewedAt = new Date();

    await feedback.save();
    await feedback.populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: 'Feedback approved successfully',
      feedback
    });
  } catch (error) {
    console.error('Admin feedback approve error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve feedback'
    });
  }
});

// Delete feedback (only unreviewed feedback can be deleted)
router.delete('/feedback/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Only allow deletion of unreviewed feedback
    if (feedback.isReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete reviewed feedback. Only unreviewed feedback can be deleted.'
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Admin feedback delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback'
    });
  }
});

// Subscriptions Management
router.get('/subscriptions', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      plan,
      interval,
      isActive,
      sortBy = '-subscription.expiresAt'
    } = req.query;

    // Build filter
    const filter = { 'subscription.plan': 'pro' };
    if (plan) filter['subscription.plan'] = plan;
    if (interval) filter['subscription.interval'] = interval;
    if (isActive !== undefined) {
      if (isActive === 'true') {
        filter.$or = [
          { 'subscription.expiresAt': { $exists: false } },
          { 'subscription.expiresAt': { $gt: new Date() } }
        ];
      } else {
        filter['subscription.expiresAt'] = { $lte: new Date() };
      }
    }

    const users = await User.find(filter)
      .select('name email role subscription createdAt')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        subscriptions: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin subscriptions fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
});

export default router;