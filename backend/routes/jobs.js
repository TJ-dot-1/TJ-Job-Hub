import express from 'express';
import Job from '../models/Job.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { subscriptionGuard } from '../middleware/subscription.js';

const router = express.Router();

// POST /api/jobs - Create a new job
router.post('/', verifyToken, requireRole(['employer']), async function(req, res) {
  try {
    // Basic request validation
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({
        success: false,
        message: 'Job title and description are required'
      });
    }

    // Fetch the user from database using the userId from token
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid JWT token.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Only employers can post jobs.'
      });
    }

    // Check if company info exists
    if (!user.company?.name) {
      return res.status(400).json({
        success: false,
        message: 'Company information is required. Please update your company profile first.'
      });
    }

    // Check subscription limits
    const permission = user.canPerformAction('post_job');
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: 'Subscription limit reached',
        reason: permission.reason,
        upgradeRequired: true,
        pricingUrl: '/pricing'
      });
    }

    // Check if skills are properly formatted
    const skills = req.body.requirements?.skills;
    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array of objects with name and level properties'
      });
    }

    // Transform string skills into proper objects if needed
    let formattedSkills = [];
    if (skills) {
      formattedSkills = skills.map(skill => {
        if (typeof skill === 'string') {
          return {
            name: skill.trim().toLowerCase(),
            level: 'intermediate'
          };
        }
        return skill;
      });
    }

    // Ensure company, companyDetails and createdBy are properly set
    const jobData = {
      ...req.body,
      company: req.body.company || user._id, // Fallback to authenticated user if company not provided
      companyDetails: {
        ...req.body.companyDetails,
        name: req.body.companyDetails?.name || user.company?.name // Fallback to user's company name
      },
      createdBy: user._id, // Set the creator to the authenticated user
      status: 'active', // Set initial status
      title: req.body.title // Ensure title is set for slug generation
    };

    // Update skills if they were formatted
    if (formattedSkills.length > 0) {
      jobData.requirements = {
        ...jobData.requirements,
        skills: formattedSkills
      };
    }

    // Remove seo object entirely to avoid index conflicts
    delete jobData.seo;

    try {
      const job = new Job(jobData);
      await job.save();

      // Fetch the saved job with populated company details
      const savedJob = await Job.findById(job._id)
        .populate('company', 'name email company.logo company.website');

      // Increment usage counter after successful job creation
      await user.incrementUsage('post_job');

      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        data: savedJob
      });
      return;
    } catch (validationError) {
      console.error('Job creation error:', validationError);

      // Handle validation errors specifically
      if (validationError.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: Object.values(validationError.errors).map(err => err.message)
        });
      }

      // Handle duplicate key errors
      if (validationError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'A job with similar details already exists',
          error: validationError.message
        });
      }

      throw validationError; // Let the outer catch handle other errors
    }
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Error creating job', 
      error: error.message,
      details: error.errors 
    });
  }
});

// GET /api/jobs - Get all jobs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      query,
      location,
      category,
      jobType,
      remotePolicy,
      minSalary,
      experience,
      page = 1,
      limit = 10,
      sortBy = '-postedAt'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    // Text search across multiple fields
    if (query) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { 'requirements.skills.name': { $regex: query, $options: 'i' } },
          { 'companyDetails.name': { $regex: query, $options: 'i' } }
        ]
      });
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Job type filter
    if (jobType) {
      filter.jobType = jobType;
    }

    // Remote policy filter
    if (remotePolicy) {
      filter.remotePolicy = remotePolicy;
    }

    // Minimum salary filter
    if (minSalary) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { 'salary.min': { $gte: Number(minSalary) } },
          { 'salary.max': { $gte: Number(minSalary) } }
        ]
      });
    }

    // Experience filter
    if (experience) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { 'requirements.experience.min': { $lte: Number(experience) } },
          { 'requirements.experience.max': { $gte: Number(experience) } }
        ]
      });
    }

    // Ensure jobs haven't expired
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ];

    console.log('Fetching jobs with filter:', JSON.stringify(filter, null, 2));

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Job.countDocuments(filter);

    // Fetch jobs with population and sorting
    const jobs = await Job.find(filter)
      .populate('company', 'name email company.logo company.name')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean for better performance

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        jobs,
        total,
        page: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/jobs/featured - Get featured jobs
router.get('/featured', async (req, res) => {
  try {
    const featuredJobs = await Job.find({
      status: 'active',
      isFeatured: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .populate('company', 'name company.logo company.name')
    .sort('-postedAt')
    .limit(6)
    .lean();

    res.json({
      success: true,
      data: featuredJobs
    });
  } catch (error) {
    console.error('Error fetching featured jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured jobs'
    });
  }
});

// GET /api/jobs/company/:companyId - Get jobs by company
router.get('/company/:companyId', async (req, res) => {
  try {
    const jobs = await Job.find({
      company: req.params.companyId,
      status: 'active',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .populate('company', 'name logo')
    .sort('-postedAt');

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company jobs'
    });
  }
});

// GET /api/jobs/recommended - Get recommended jobs for job seekers
router.get('/recommended', verifyToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const user = await (await import('../models/User.js')).default.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build recommendation filter based on user profile
    const filter = { status: 'active' };

    // Filter by preferred job types
    if (user.profile?.preferredJobTypes?.length > 0) {
      filter.jobType = { $in: user.profile.preferredJobTypes };
    }

    // Filter by skills (if user has skills)
    if (user.profile?.skills?.length > 0) {
      const userSkillNames = user.profile.skills.map(skill => skill.name);
      filter.$or = [
        { 'requirements.skills.name': { $in: userSkillNames } },
        { title: { $regex: userSkillNames.join('|'), $options: 'i' } },
        { description: { $regex: userSkillNames.join('|'), $options: 'i' } }
      ];
    }

    // Filter by location preference
    if (user.profile?.location?.city) {
      filter.location = { $regex: user.profile.location.city, $options: 'i' };
    }

    // Ensure jobs haven't expired
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    });

    // Get recommended jobs
    const recommendedJobs = await Job.find(filter)
      .populate('company', 'name company.logo company.name')
      .sort('-postedAt')
      .limit(10)
      .lean();

    res.json({
      success: true,
      jobs: recommendedJobs
    });
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended jobs'
    });
  }
});

// POST /api/jobs/:id/save - Save a job for user
router.post('/:id/save', verifyToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.userId;

    // Check if job exists
    const Job = (await import('../models/Job.js')).default;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already saved
    const SavedJob = (await import('../models/SavedJob.js')).default;
    const existingSave = await SavedJob.findOne({ userId, jobId });

    if (existingSave) {
      return res.status(400).json({
        success: false,
        message: 'Job already saved'
      });
    }

    // Save the job
    const savedJob = new SavedJob({ userId, jobId });
    await savedJob.save();

    res.json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving job'
    });
  }
});

// DELETE /api/jobs/:id/save - Unsave a job for user
router.delete('/:id/save', verifyToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.userId;

    const SavedJob = (await import('../models/SavedJob.js')).default;
    const result = await SavedJob.findOneAndDelete({ userId, jobId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Job not found in saved jobs'
      });
    }

    res.json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving job:', error);
    res.status(500).json({
      success: false,
      message: 'Error unsaving job'
    });
  }
});

// GET /api/jobs/saved - Get user's saved jobs
router.get('/saved', verifyToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const SavedJob = (await import('../models/SavedJob.js')).default;
    const Job = (await import('../models/Job.js')).default;

    const savedJobs = await SavedJob.find({ userId: req.userId })
      .populate({
        path: 'jobId',
        populate: {
          path: 'company',
          select: 'name company.logo company.name'
        }
      })
      .sort({ savedAt: -1 });

    // Filter out null jobId (in case jobs were deleted)
    const validSavedJobs = savedJobs.filter(save => save.jobId).map(save => ({
      ...save.jobId.toObject(),
      savedAt: save.savedAt
    }));

    res.json({
      success: true,
      jobs: validSavedJobs
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs'
    });
  }
});

// GET /api/jobs/categories - Get job categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Job.aggregate([
      {
        $match: {
          status: 'active',
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      },
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
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// GET /api/jobs/:id - Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name email company.logo company.name company.website company.description')
      .populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment views
    await Job.findByIdAndUpdate(req.params.id, {
      $inc: { 'metadata.views': 1 },
      $set: { 'metadata.lastViewed': new Date() }
    });

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job'
    });
  }
});

// PUT /api/jobs/:id - Update job (for employers)
router.put('/:id', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    // Find the job and check ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns this job
    if (job.company.toString() !== userId && job.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own jobs'
      });
    }

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('company', 'name email company.logo company.name company.website company.description');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job'
    });
  }
});

// PUT /api/jobs/:id/status - Update job status (pause/unpause)
router.put('/:id/status', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const { status } = req.body;

    // Validate status
    if (!['active', 'paused', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, paused, or draft'
      });
    }

    // Find the job and check ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns this job
    if (job.company.toString() !== userId && job.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own jobs'
      });
    }

    // Update the job status
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('company', 'name email company.logo company.name company.website company.description');

    res.json({
      success: true,
      message: `Job ${status === 'paused' ? 'paused' : status === 'active' ? 'activated' : 'saved as draft'} successfully`,
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job status'
    });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', verifyToken, requireRole(['employer']), async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    // Find the job and check ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns this job
    if (job.company.toString() !== userId && job.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own jobs'
      });
    }

    // Delete the job
    await Job.findByIdAndDelete(jobId);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job'
    });
  }
});

// GET /api/jobs/recommended - Get recommended jobs for job seekers
router.get('/recommended', verifyToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    const user = await (await import('../models/User.js')).default.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build recommendation filter based on user profile
    const filter = { status: 'active' };

    // Filter by preferred job types
    if (user.profile?.preferredJobTypes?.length > 0) {
      filter.jobType = { $in: user.profile.preferredJobTypes };
    }

    // Filter by skills (if user has skills)
    if (user.profile?.skills?.length > 0) {
      const userSkillNames = user.profile.skills.map(skill => skill.name);
      filter.$or = [
        { 'requirements.skills.name': { $in: userSkillNames } },
        { title: { $regex: userSkillNames.join('|'), $options: 'i' } },
        { description: { $regex: userSkillNames.join('|'), $options: 'i' } }
      ];
    }

    // Filter by location preference
    if (user.profile?.location?.city) {
      filter.location = { $regex: user.profile.location.city, $options: 'i' };
    }

    // Ensure jobs haven't expired
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ];

    // Get recommended jobs
    const recommendedJobs = await Job.find(filter)
      .populate('company', 'name company.logo company.name')
      .sort('-postedAt')
      .limit(10)
      .lean();

    res.json({
      success: true,
      jobs: recommendedJobs
    });
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended jobs'
    });
  }
});

// GET /api/jobs/saved - Get user's saved jobs
router.get('/saved', verifyToken, requireRole(['job_seeker']), async (req, res) => {
  try {
    // For now, return empty array as saved jobs functionality might be implemented later
    // This would typically involve a separate SavedJob model or a field in User model
    res.json({
      success: true,
      jobs: []
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs'
    });
  }
});

// Test endpoint to verify backend is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Jobs API is working',
    timestamp: new Date().toISOString()
  });
});

export default router;