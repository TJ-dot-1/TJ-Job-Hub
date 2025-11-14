// routes/assessments.js
import express from 'express';
import Assessment from '../models/Assessment.js';
import { verifyToken } from '../middleware/auth.js';
import { subscriptionGuard } from '../middleware/subscription.js';

const router = express.Router();

// GET /api/assessments - Get all assessments
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;

    let query = { isActive: true };

    if (category && category !== 'All Categories') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All Levels') {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    const assessments = await Assessment.find(query)
      .sort('-createdAt')
      .limit(50);

    // Add mock data for takers and rating if not present
    const assessmentsWithStats = assessments.map(assessment => ({
      ...assessment.toObject(),
      takers: assessment.attempts || Math.floor(Math.random() * 10000) + 1000,
      rating: assessment.averageRating || (4.0 + Math.random() * 1.0)
    }));

    res.json({
      success: true,
      data: assessmentsWithStats
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessments'
    });
  }
});

// GET /api/assessments/:id - Get assessment by ID
router.get('/:id', verifyToken, subscriptionGuard('view_advice'), async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessment'
    });
  }
});

// POST /api/assessments/:id/attempt - Record assessment attempt
router.post('/:id/attempt', async (req, res) => {
  try {
    const { score, answers } = req.body;

    // Update attempt count
    await Assessment.findByIdAndUpdate(req.params.id, {
      $inc: { attempts: 1 }
    });

    res.json({
      success: true,
      message: 'Assessment attempt recorded'
    });
  } catch (error) {
    console.error('Error recording assessment attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording assessment attempt'
    });
  }
});

export default router;