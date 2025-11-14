import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// Submit feedback (public endpoint - no auth required)
router.post('/', async (req, res) => {
  try {
    const { name, email, message, category, rating } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Get user info if authenticated
    let userId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
        userId = decoded.userId;
      } catch (error) {
        // Token invalid, continue as anonymous
      }
    }

    // Create feedback
    const feedback = new Feedback({
      user: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      category: category || 'general',
      rating: rating ? parseInt(rating) : null,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! We appreciate your input.',
      feedbackId: feedback._id
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.'
    });
  }
});

// Get all feedback (admin only) or approved feedback (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, isReviewed } = req.query;

    // Check if this is an admin request (has auth token)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let isAdmin = false;

    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
        isAdmin = decoded.role === 'admin';
      } catch (error) {
        // Token invalid, continue as public request
      }
    }

    // Build filter
    const filter = {};

    if (isAdmin) {
      // Admin can see all feedback with filters
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (isReviewed !== undefined) filter.isReviewed = isReviewed === 'true';
    } else {
      // Public can only see approved feedback
      filter.status = 'approved';
    }

    const feedback = await Feedback.find(filter)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(filter);

    res.json({
      success: true,
      feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
});

// Get feedback statistics (admin only)
router.get('/stats', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          reviewed: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
          },
          responded: {
            $sum: { $cond: [{ $eq: ['$status', 'responded'] }, 1, 0] }
          },
          closed: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
          },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        total: 0,
        pending: 0,
        reviewed: 0,
        responded: 0,
        closed: 0,
        averageRating: 0
      },
      categoryStats
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics'
    });
  }
});

// Update feedback status (admin only)
router.put('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { status, response } = req.body;
    const feedbackId = req.params.id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update status
    feedback.status = status || feedback.status;

    // If responding, add response
    if (response && response.trim()) {
      feedback.response = response.trim();
      feedback.status = 'responded';
    }

    // Mark as reviewed
    feedback.isReviewed = true;
    feedback.reviewedBy = req.user._id;
    feedback.reviewedAt = new Date();

    await feedback.save();

    // Populate for response
    await feedback.populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback'
    });
  }
});

// Delete feedback (admin only)
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback'
    });
  }
});

export default router;