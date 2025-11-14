import express from 'express';
import mongoose from 'mongoose';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import EmployerProfile from '../models/EmployerProfile.js';
import imagekit from '../config/imagekit.js';
import multer from 'multer';
import { createNotification } from './notifications.js';

// Configure multer for logo uploads
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// Get employer dashboard stats
router.get('/dashboard/stats', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;

    // Get job statistics
    const jobStats = await Job.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(employerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalApplications: { $sum: '$metadata.applications' },
          totalViews: { $sum: '$metadata.views' }
        }
      }
    ]);

    // Get application statistics
    const applicationStats = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData'
        }
      },
      {
        $match: {
          'jobData.company': new mongoose.Types.ObjectId(employerId)
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate totals
    const totalJobs = jobStats.reduce((sum, stat) => sum + stat.count, 0);
    const activeJobsCount = jobStats.find(stat => stat._id === 'active')?.count || 0;
    const totalApplicationsFromJobs = jobStats.reduce((sum, stat) => sum + (stat.totalApplications || 0), 0);
    const totalViewsFromJobs = jobStats.reduce((sum, stat) => sum + (stat.totalViews || 0), 0);
    
    const newApplications = applicationStats.find(stat => stat._id === 'pending')?.count || 0;
    const interviewScheduled = applicationStats.find(stat => stat._id === 'interview')?.count || 0;
    const hiredCount = applicationStats.find(stat => stat._id === 'accepted')?.count || 0;
    const totalApplications = applicationStats.reduce((sum, stat) => sum + stat.count, 0);

    res.json({
      success: true,
      data: {
        totalJobs,
        activeJobs: activeJobsCount,
        totalApplications,
        newApplications,
        interviewScheduled,
        hired: hiredCount
      }
    });
  } catch (error) {
    console.error('Employer dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
});

// Get recent applications for dashboard
router.get('/dashboard/applications', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const applications = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $match: {
          'jobData.company': new mongoose.Types.ObjectId(employerId)
        }
      },
      {
        $sort: { appliedAt: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 1,
          status: 1,
          appliedAt: 1,
          coverLetter: 1,
          rating: { $ifNull: ['$rating.score', 0] },
          match: { $ifNull: ['$aiMatch.score', 85] },
          job: {
            _id: '$jobData._id',
            title: { $arrayElemAt: ['$jobData.title', 0] }
          },
          applicant: {
            _id: { $arrayElemAt: ['$userData._id', 0] },
            name: { $arrayElemAt: ['$userData.name', 0] },
            email: { $arrayElemAt: ['$userData.email', 0] },
            title: { $arrayElemAt: ['$userData.title', 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Employer dashboard applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent applications'
    });
  }
});

// Get active jobs for dashboard
router.get('/dashboard/jobs', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;
    const status = req.query.status || 'active';
    const limit = parseInt(req.query.limit) || 3;

    const jobs = await Job.find({
      company: employerId,
      status: status
    })
    .select('title description location jobType salary metadata postedAt status')
    .sort({ postedAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Employer dashboard jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active jobs'
    });
  }
});

// Get employer's jobs with pagination and filtering
router.get('/jobs', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const employerId = req.user.id;

    let query = { company: employerId };
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('company', 'name company.name company.logo')
      .sort({ postedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
});

// Get applications for employer's jobs
router.get('/applications', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const { jobId, status, page = 1, limit = 10, search } = req.query;
    const employerId = req.user.id;

    // Build aggregation pipeline to get applications with full user profile data
    let matchConditions = {
      'job.company': new mongoose.Types.ObjectId(employerId)
    };

    if (jobId) matchConditions.job = new mongoose.Types.ObjectId(jobId);
    if (status) matchConditions.status = status;

    let aggregationPipeline = [
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: matchConditions
      },
      {
        $unwind: '$job'
      },
      {
        $unwind: '$user'
      }
    ];

    // Add search filter if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      aggregationPipeline.push({
        $match: {
          $or: [
            { 'user.name': searchRegex },
            { 'user.email': searchRegex },
            { 'job.title': searchRegex },
            { 'user.profile.headline': searchRegex }
          ]
        }
      });
    }

    // Add projection
    aggregationPipeline.push({
      $project: {
        _id: 1,
        status: 1,
        appliedAt: 1,
        coverLetter: 1,
        aiMatch: 1,
        rating: 1,
        notes: 1,
        job: {
          _id: '$job._id',
          title: '$job.title',
          company: '$job.company'
        },
        user: {
          _id: '$user._id',
          name: '$user.name',
          email: '$user.email',
          profile: '$user.profile'
        },
        resume: {
          url: '$user.profile.resume',
          previewUrl: '$user.profile.resumePreview'
        }
      }
    });

    // Add sorting, pagination
    aggregationPipeline.push(
      { $sort: { appliedAt: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    const applications = await Application.aggregate(aggregationPipeline);

    // Get total count for pagination (with search filter if provided)
    let countPipeline = [
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: matchConditions
      },
      {
        $unwind: '$job'
      },
      {
        $unwind: '$user'
      }
    ];

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      countPipeline.push({
        $match: {
          $or: [
            { 'user.name': searchRegex },
            { 'user.email': searchRegex },
            { 'job.title': searchRegex },
            { 'user.profile.headline': searchRegex }
          ]
        }
      });
    }

    countPipeline.push({ $count: 'total' });

    const totalResult = await Application.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

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
    console.error('Get employer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// Update application status
router.put('/applications/:applicationId/status', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, interviewDate, notes } = req.body;
    const employerId = req.user.id;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'interview', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Find and update application
    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('user');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify employer owns this job
    if (application.job.company.toString() !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this application'
      });
    }

    // Update application
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'interview' && interviewDate) {
      updateData.interviewDate = new Date(interviewDate);
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('job').populate('user');

    // Create notification for job seeker
    const notificationMessage = getStatusNotificationMessage(status, application.job.title, interviewDate);

    // Create persistent notification in database
    await createNotification(
      application.user._id,
      'application_status',
      `Application Status Update - ${application.job.title}`,
      notificationMessage,
      {
        applicationId: application._id,
        jobId: application.job._id,
        employerId: req.user.id,
        status,
        interviewDate: interviewDate || null
      }
    );

    // Emit real-time notification via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${application.user._id}`).emit('application_status_update', {
        applicationId: application._id,
        status,
        jobTitle: application.job.title,
        message: notificationMessage,
        interviewDate: interviewDate || null
      });
    }

    // TODO: Send email notification here if needed

    res.json({
      success: true,
      application: updatedApplication,
      message: `Application status updated to ${status}`
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status'
    });
  }
});

// Helper function for status notification messages
function getStatusNotificationMessage(status, jobTitle, interviewDate) {
  switch (status) {
    case 'reviewed':
      return `Your application for "${jobTitle}" is under review.`;
    case 'interview':
      return `Congratulations! You've been selected for an interview for "${jobTitle}".${interviewDate ? ` Interview scheduled for ${new Date(interviewDate).toLocaleDateString()}.` : ''}`;
    case 'accepted':
      return `Congratulations! Your application for "${jobTitle}" has been accepted.`;
    case 'rejected':
      return `Thank you for your interest in "${jobTitle}". Unfortunately, we have decided to move forward with other candidates at this time.`;
    default:
      return `Your application status for "${jobTitle}" has been updated.`;
  }
}

// Export applications as CSV
router.get('/applications/export', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const { jobId, status, search } = req.query;
    const employerId = req.user.id;

    // Build aggregation pipeline to get applications with full user profile data
    let matchConditions = {
      'job.company': new mongoose.Types.ObjectId(employerId)
    };

    if (jobId) matchConditions.job = new mongoose.Types.ObjectId(jobId);
    if (status) matchConditions.status = status;

    let aggregationPipeline = [
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: matchConditions
      },
      {
        $unwind: '$job'
      },
      {
        $unwind: '$user'
      }
    ];

    // Add search filter if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      aggregationPipeline.push({
        $match: {
          $or: [
            { 'user.name': searchRegex },
            { 'user.email': searchRegex },
            { 'job.title': searchRegex },
            { 'user.profile.headline': searchRegex }
          ]
        }
      });
    }

    // Add projection for CSV export
    aggregationPipeline.push({
      $project: {
        _id: 1,
        status: 1,
        appliedAt: 1,
        coverLetter: 1,
        aiMatch: 1,
        rating: 1,
        notes: 1,
        'Job Title': '$job.title',
        'Applicant Name': '$user.name',
        'Applicant Email': '$user.email',
        'Applicant Phone': '$user.profile.phone',
        'Applicant Location': '$user.profile.location',
        'Applicant Headline': '$user.profile.headline',
        'Applicant Bio': '$user.profile.bio',
        'Resume URL': '$user.profile.resume',
        'LinkedIn': '$user.profile.socialLinks.linkedin',
        'GitHub': '$user.profile.socialLinks.github',
        'Twitter': '$user.profile.socialLinks.twitter',
        'Website': '$user.profile.website'
      }
    });

    // Add sorting
    aggregationPipeline.push({ $sort: { appliedAt: -1 } });

    const applications = await Application.aggregate(aggregationPipeline);

    // Generate CSV
    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'No applications found to export' });
    }

    const headers = Object.keys(applications[0]).filter(key => key !== '_id');
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    applications.forEach(app => {
      const row = headers.map(header => {
        const value = app[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=applications-export-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting applications'
    });
  }
});

// Update application status
router.put('/applications/:id/status', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const { status, note } = req.body;
    const applicationId = req.params.id;

    // Verify the application belongs to employer's job
    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if employer owns the job
    if (application.job.company.toString() !== req.user.id) {
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
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status'
    });
  }
});

// Schedule interview
router.post('/applications/:id/interview', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const { scheduledAt, duration, type, meetingLink, notes } = req.body;
    const applicationId = req.params.id;

    // Verify the application belongs to employer's job
    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    application.interview = {
      scheduledAt: new Date(scheduledAt),
      duration,
      type,
      meetingLink,
      notes,
      interviewer: req.user.id
    };

    application.status = 'interview';

    await application.save();

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      application
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling interview'
    });
  }
});

// Rate applicant
router.post('/applications/:id/rate', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const { score, comment } = req.body;
    const applicationId = req.params.id;

    // Verify the application belongs to employer's job
    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    application.rating = {
      score,
      comment,
      ratedBy: req.user.id,
      ratedAt: new Date()
    };

    await application.save();

    res.json({
      success: true,
      message: 'Applicant rated successfully',
      application
    });
  } catch (error) {
    console.error('Rate applicant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rating applicant'
    });
  }
});

// Get employer analytics
router.get('/analytics', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // 30d
        startDate.setDate(now.getDate() - 30);
    }

    // Get job IDs for this employer
    const jobIds = await Job.find({ company: employerId }).distinct('_id');

    // Applications over time
    const applicationsOverTime = await Application.aggregate([
      {
        $match: {
          job: { $in: jobIds },
          appliedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Application status distribution
    const statusDistribution = await Application.aggregate([
      {
        $match: {
          job: { $in: jobIds }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performing jobs
    const topJobs = await Job.find({ company: employerId })
      .sort({ 'metadata.applications': -1 })
      .limit(5)
      .select('title metadata.applications metadata.views status');

    // Conversion rates
    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const hiredApplications = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'accepted' 
    });
    const interviewApplications = await Application.countDocuments({ 
      job: { $in: jobIds }, 
      status: 'interview' 
    });

    const conversionRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;
    const interviewRate = totalApplications > 0 ? (interviewApplications / totalApplications) * 100 : 0;

    res.json({
      success: true,
      analytics: {
        period,
        applicationsOverTime,
        statusDistribution,
        topJobs,
        conversionMetrics: {
          totalApplications,
          hiredApplications,
          interviewApplications,
          conversionRate: Math.round(conversionRate * 100) / 100,
          interviewRate: Math.round(interviewRate * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Employer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// Employer Profile Routes

// Create employer profile
router.post('/profile', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;

    // Check if profile already exists
    const existingProfile = await EmployerProfile.findOne({ employerId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Employer profile already exists. Use PUT to update.'
      });
    }

    const profileData = {
      ...req.body,
      employerId
    };

    const profile = new EmployerProfile(profileData);
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Employer profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('Create employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating employer profile'
    });
  }
});

// Get employer's own profile
router.get('/profile', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;

    const profile = await EmployerProfile.findOne({ employerId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employer profile'
    });
  }
});

// Update employer profile
router.put('/profile', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;

    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Employer profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employer profile'
    });
  }
});

// Get public employer profile (for job seekers)
router.get('/profile/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;

    // Validate employerId format
    if (!employerId || !employerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employer ID format'
      });
    }

    const profile = await EmployerProfile.findOne({ employerId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    res.json({
      success: true,
      data: profile.getPublicProfile()
    });
  } catch (error) {
    console.error('Get public employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employer profile'
    });
  }
});

// Upload company logo
router.post('/profile/logo', verifyToken, requireRole(['employer']), upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const base64Image = req.file.buffer.toString('base64');

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `company-logo-${Date.now()}`,
      folder: '/company-logos',
      useUniqueFileName: true,
      extensions: [
        {
          name: "google-auto-tagging",
          maxTags: 5,
          minConfidence: 95
        }
      ]
    });

    if (!uploadResponse.url) {
      throw new Error('Failed to upload image to ImageKit');
    }

    // Update employer profile with logo URL
    const employerId = req.user.id;
    const profile = await EmployerProfile.findOneAndUpdate(
      { employerId },
      { logo: uploadResponse.url, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Company logo uploaded successfully',
      logo: uploadResponse.url,
      data: profile
    });
  } catch (error) {
    console.error('Company logo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading company logo'
    });
  }
});

// Delete employer profile
router.delete('/profile', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;

    const profile = await EmployerProfile.findOneAndDelete({ employerId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Employer profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employer profile'
    });
  }
});

export default router;