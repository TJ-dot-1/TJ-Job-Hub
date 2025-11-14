import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken } from '../middleware/auth.js';
import { subscriptionGuard } from '../middleware/subscription.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import aiService from '../utils/aiService.js';
const router = express.Router();

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each user to 50 requests per windowMs
  message: 'Too many AI requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Job Recommendations
router.get('/recommendations', verifyToken, subscriptionGuard('view_advice'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { page = 1, limit = 10 } = req.query;

    // Get user preferences and skills
    const userSkills = user.profile.skills?.map(skill => skill.name) || [];
    const preferredJobTypes = user.profile.preferredJobTypes || [];
    const preferredLocation = user.profile.location?.city;
    const salaryExpectation = user.profile.salaryExpectation;

    // Advanced matching algorithm
    const matchPipeline = [
      {
        $match: {
          status: 'active',
          $or: [
            { deadline: { $gte: new Date() } },
            { deadline: null }
          ]
        }
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              // Skill matching (40% weight)
              {
                $multiply: [
                  {
                    $size: {
                      $setIntersection: [
                        '$requirements.skills.name',
                        userSkills
                      ]
                    }
                  },
                  40
                ]
              },
              // Job type preference (20% weight)
              {
                $cond: {
                  if: { $in: ['$jobType', preferredJobTypes] },
                  then: 20,
                  else: 0
                }
              },
              // Location matching (15% weight)
              {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$location', preferredLocation] },
                      { $eq: ['$remotePolicy', 'remote'] }
                    ]
                  },
                  then: 15,
                  else: 0
                }
              },
              // Salary expectation matching (15% weight)
              {
                $cond: {
                  if: {
                    $and: [
                      salaryExpectation,
                      { $lte: ['$salary.min', salaryExpectation.max] },
                      { $gte: ['$salary.max', salaryExpectation.min] }
                    ]
                  },
                  then: 15,
                  else: 0
                }
              },
              // Company reputation boost (10% weight)
              { $rand: { $multiply: [10, 1] } }
            ]
          }
        }
      },
      { $match: { matchScore: { $gte: 30 } } }, // Minimum match threshold
      { $sort: { matchScore: -1, postedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'company',
          foreignField: '_id',
          as: 'companyInfo'
        }
      },
      { $unwind: '$companyInfo' }
    ];

    const recommendedJobs = await Job.aggregate(matchPipeline);

    res.json({
      success: true,
      jobs: recommendedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recommendedJobs.length
      }
    });
  } catch (error) {
    console.error('AI Recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations'
    });
  }
});

// Skill Gap Analysis
router.get('/skill-gap-analysis/:jobId', verifyToken, subscriptionGuard('view_advice'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    const user = await User.findById(req.user.id);

    const requiredSkills = job.requirements.skills.map(skill => skill.name);
    const userSkills = user.profile.skills.map(skill => skill.name);

    const missingSkills = requiredSkills.filter(skill => 
      !userSkills.includes(skill)
    );
    const matchingSkills = requiredSkills.filter(skill => 
      userSkills.includes(skill)
    );

    const matchPercentage = (matchingSkills.length / requiredSkills.length) * 100;

    res.json({
      success: true,
      analysis: {
        matchPercentage: Math.round(matchPercentage),
        matchingSkills,
        missingSkills,
        requiredSkills,
        userSkills
      },
      recommendations: {
        skillsToLearn: missingSkills,
        learningResources: await getLearningResources(missingSkills)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing skill gap'
    });
  }
});

// Salary Insights
router.get('/salary-insights', async (req, res) => {
  try {
    const { title, location, experience } = req.query;

    const pipeline = [
      {
        $match: {
          title: new RegExp(title, 'i'),
          ...(location && { location: new RegExp(location, 'i') }),
          'salary.min': { $exists: true },
          'salary.max': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgMin: { $avg: '$salary.min' },
          avgMax: { $avg: '$salary.max' },
          minSalary: { $min: '$salary.min' },
          maxSalary: { $max: '$salary.max' },
          count: { $sum: 1 },
          jobs: { $push: '$$ROOT' }
        }
      }
    ];

    const insights = await Job.aggregate(pipeline);

    res.json({
      success: true,
      insights: insights[0] || {},
      title,
      location,
      experience
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating salary insights'
    });
  }
});

// Job Seeker AI Endpoints

// Career Guidance
router.post('/career-guidance', verifyToken, subscriptionGuard('view_advice'), aiRateLimit, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { jobInterests } = req.body;

    const guidance = await aiService.generateCareerGuidance(user.profile, jobInterests);

    res.json({
      success: true,
      guidance,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Career guidance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate career guidance. Please try again later.',
      fallback: 'Consider exploring job opportunities in your field of expertise and networking with professionals.'
    });
  }
});

// CV Optimization
router.post('/cv-optimize', verifyToken, subscriptionGuard('view_advice'), aiRateLimit, async (req, res) => {
  try {
    const { cvText, jobDescription } = req.body;

    if (!cvText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'CV text and job description are required'
      });
    }

    const optimization = await aiService.optimizeCV(cvText, jobDescription);

    res.json({
      success: true,
      optimization,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('CV optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize CV. Please try again later.',
      fallback: 'Focus on highlighting relevant skills and using industry-specific keywords.'
    });
  }
});

// Interview Preparation
router.post('/interview-prep', verifyToken, subscriptionGuard('view_advice'), aiRateLimit, async (req, res) => {
  try {
    const { jobDescription, experienceLevel = 'mid' } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    const questions = await aiService.generateInterviewQuestions(jobDescription, experienceLevel);

    res.json({
      success: true,
      questions,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Interview prep error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate interview questions. Please try again later.',
      fallback: 'Prepare by researching the company and practicing common behavioral questions.'
    });
  }
});

// Career Assistant Chat
router.post('/career-chat', verifyToken, subscriptionGuard('view_advice'), aiRateLimit, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const userContext = {
      profile: user.profile,
      skills: user.profile.skills?.map(s => s.name) || [],
      experience: user.profile.experience || [],
      location: user.profile.location
    };

    const response = await aiService.chatWithCareerAssistant(message, userContext);

    res.json({
      success: true,
      response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Career chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message. Please try again later.',
      fallback: 'I\'m here to help with your career questions. Please rephrase your question.'
    });
  }
});

// Smart Job Search
router.post('/smart-search', verifyToken, subscriptionGuard('view_advice'), aiRateLimit, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { searchQuery } = req.body;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const recommendations = await aiService.getSmartJobRecommendations(user.profile, searchQuery);

    res.json({
      success: true,
      recommendations,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate smart recommendations. Please try again later.',
      fallback: 'Try using specific keywords related to your skills and desired job title.'
    });
  }
});

// Employer AI Endpoints

// Job Description Generation
router.post('/generate-job-description', verifyToken, aiRateLimit, async (req, res) => {
  try {
    const { jobDetails } = req.body;

    if (!jobDetails) {
      return res.status(400).json({
        success: false,
        message: 'Job details are required'
      });
    }

    const description = await aiService.generateJobDescription(jobDetails);

    res.json({
      success: true,
      description,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Job description generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate job description. Please try again later.',
      fallback: 'Include key responsibilities, requirements, and company benefits in your job posting.'
    });
  }
});

// Candidate Screening
router.post('/screen-candidate', verifyToken, aiRateLimit, async (req, res) => {
  try {
    const { cvText, jobRequirements } = req.body;

    if (!cvText || !jobRequirements) {
      return res.status(400).json({
        success: false,
        message: 'CV text and job requirements are required'
      });
    }

    const screening = await aiService.screenCandidate(cvText, jobRequirements);

    res.json({
      success: true,
      screening,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Candidate screening error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to screen candidate. Please try again later.',
      fallback: 'Review the candidate\'s experience, skills match, and cultural fit manually.'
    });
  }
});

// Recruitment Insights
router.post('/recruitment-insights', verifyToken, aiRateLimit, async (req, res) => {
  try {
    const { jobData, marketData } = req.body;

    if (!jobData) {
      return res.status(400).json({
        success: false,
        message: 'Job data is required'
      });
    }

    const insights = await aiService.generateRecruitmentInsights(jobData, marketData || {});

    res.json({
      success: true,
      insights,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Recruitment insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recruitment insights. Please try again later.',
      fallback: 'Consider posting jobs during business hours and offering competitive compensation.'
    });
  }
});

// Recruiter Assistant Chat
router.post('/recruiter-chat', verifyToken, aiRateLimit, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const employerContext = {
      company: user.company,
      industry: user.profile?.industry,
      role: user.role
    };

    const response = await aiService.chatWithRecruiterAssistant(message, employerContext);

    res.json({
      success: true,
      response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Recruiter chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process recruiter chat. Please try again later.',
      fallback: 'I\'m here to help with your recruitment questions. Please rephrase your question.'
    });
  }
});

async function getLearningResources(skills) {
  // Integrate with learning platforms API
  // This is a mock implementation
  return skills.map(skill => ({
    skill,
    resources: [
      {
        platform: 'Coursera',
        title: `Learn ${skill}`,
        url: `https://coursera.org/learn/${skill.toLowerCase()}`,
        type: 'course'
      },
      {
        platform: 'Udemy',
        title: `${skill} Masterclass`,
        url: `https://udemy.com/course/${skill.toLowerCase()}`,
        type: 'course'
      }
    ]
  }));
}

export default router;