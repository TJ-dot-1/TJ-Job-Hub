import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
const router = express.Router();

// Employer Analytics
router.get('/employer', requireAuth(), async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      recentApplications,
      applicationsByStatus,
      viewsData,
      popularJobs
    ] = await Promise.all([
      // Total jobs posted
      Job.countDocuments({ company: req.user.id }),

      // Active jobs
      Job.countDocuments({ 
        company: req.user.id,
        status: 'active',
        $or: [
          { deadline: { $gte: new Date() } },
          { deadline: null }
        ]
      }),

      // Total applications
      Application.countDocuments({ 
        job: { $in: await Job.find({ company: req.user.id }).distinct('_id') }
      }),

      // Recent applications (last 30 days)
      Application.countDocuments({
        job: { $in: await Job.find({ company: req.user.id }).distinct('_id') },
        createdAt: { $gte: thirtyDaysAgo }
      }),

      // Applications by status
      Application.aggregate([
        {
          $match: {
            job: { $in: await Job.find({ company: req.user.id }).distinct('_id') }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Job views data
      Job.aggregate([
        {
          $match: { company: req.user.id }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$metadata.views' },
            avgViews: { $avg: '$metadata.views' }
          }
        }
      ]),

      // Most popular jobs
      Job.find({ company: req.user.id })
        .sort({ 'metadata.views': -1 })
        .limit(5)
        .select('title metadata.views metadata.applications')
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalJobs,
          activeJobs,
          totalApplications,
          recentApplications
        },
        applications: {
          byStatus: applicationsByStatus,
          trend: await getApplicationTrend(req.user.id)
        },
        engagement: {
          totalViews: viewsData[0]?.totalViews || 0,
          averageViews: viewsData[0]?.avgViews || 0,
          popularJobs
        },
        performance: await getPerformanceMetrics(req.user.id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// Job Seeker Analytics
router.get('/job-seeker', requireAuth(), async (req, res) => {
  try {
    if (req.user.role !== 'job_seeker') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalApplications,
      applicationsThisMonth,
      applicationsByStatus,
      interviewRate,
      profileViews,
      skillMatchRate
    ] = await Promise.all([
      Application.countDocuments({ user: req.user.id }),
      Application.countDocuments({ 
        user: req.user.id,
        createdAt: { $gte: thirtyDaysAgo }
      }),
      Application.aggregate([
        { $match: { user: req.user.id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      calculateInterviewRate(req.user.id),
      User.findById(req.user.id).select('stats.profileViews'),
      calculateSkillMatchRate(req.user.id)
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalApplications,
          applicationsThisMonth,
          interviewRate: interviewRate * 100,
          profileViews: profileViews.stats.profileViews
        },
        applications: {
          byStatus: applicationsByStatus,
          trend: await getApplicationTrendForSeeker(req.user.id)
        },
        skills: {
          matchRate: skillMatchRate * 100,
          recommendations: await getSkillRecommendations(req.user.id)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// Helper functions
async function getApplicationTrend(employerId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return Application.aggregate([
    {
      $match: {
        job: { $in: await Job.find({ company: employerId }).distinct('_id') },
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
}

async function calculateInterviewRate(userId) {
  const [interviewCount, totalApplications] = await Promise.all([
    Application.countDocuments({ 
      user: userId,
      status: { $in: ['interview', 'offer'] }
    }),
    Application.countDocuments({ user: userId })
  ]);

  return totalApplications > 0 ? interviewCount / totalApplications : 0;
}

async function calculateSkillMatchRate(userId) {
  const user = await User.findById(userId);
  const userSkills = user.profile.skills.map(s => s.name);

  const applications = await Application.find({ user: userId })
    .populate('job');

  if (applications.length === 0) return 0;

  const matchRates = applications.map(app => {
    const jobSkills = app.job.requirements.skills.map(s => s.name);
    const matchingSkills = jobSkills.filter(skill => 
      userSkills.includes(skill)
    );
    return matchingSkills.length / jobSkills.length;
  });

  return matchRates.reduce((a, b) => a + b, 0) / matchRates.length;
}

export default router;