import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { checkBettingAccess, bettingRateLimit } from '../middleware/betting.js';
import Bet from '../models/Bet.js';
import GameRound from '../models/GameRound.js';
import User from '../models/User.js';
import gameEngine from '../services/gameEngine.js';

const router = express.Router();

// All betting routes require authentication and betting access
router.use(verifyToken);
router.use(checkBettingAccess);
router.use(bettingRateLimit);

// Get current game state
router.get('/current-round', async (req, res) => {
  try {
    const state = gameEngine.getCurrentState();
    res.json({
      success: true,
      data: state
    });
  } catch (error) {
    console.error('Error getting current round:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current round'
    });
  }
});

// Place a bet
router.post('/place-bet', async (req, res) => {
  try {
    const { amount, autoCashout } = req.body;
    const userId = req.user.id;

    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum bet amount is 10 KSH'
      });
    }

    const bet = await gameEngine.placeBet(userId, amount, autoCashout);

    res.json({
      success: true,
      data: {
        betId: bet._id,
        amount: bet.amount,
        roundId: bet.gameRound
      }
    });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Cash out a bet
router.post('/cashout/:betId', async (req, res) => {
  try {
    const { betId } = req.params;
    const userId = req.user.id;

    const bet = await gameEngine.cashOut(betId, userId);

    res.json({
      success: true,
      data: {
        betId: bet._id,
        payout: bet.payout,
        multiplier: bet.cashOutMultiplier
      }
    });
  } catch (error) {
    console.error('Error cashing out:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's active bets
router.get('/active-bets', async (req, res) => {
  try {
    const userId = req.user._id;

    const bets = await Bet.find({
      user: userId,
      status: 'active'
    })
    .populate('gameRound', 'roundId status')
    .sort({ placedAt: -1 });

    res.json({
      success: true,
      data: bets
    });
  } catch (error) {
    console.error('Error getting active bets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active bets'
    });
  }
});

// Get betting history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const bets = await Bet.find({ user: userId })
      .populate('gameRound', 'roundId crashPoint status startTime')
      .sort({ placedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bet.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        bets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting betting history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get betting history'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    let dateFilter = {};

    const now = new Date();
    if (period === 'daily') {
      dateFilter = {
        cashedOutAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      };
    } else if (period === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      dateFilter = { cashedOutAt: { $gte: weekStart } };
    }

    const leaderboard = await Bet.aggregate([
      {
        $match: {
          status: 'cashed_out',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$user',
          totalWinnings: { $sum: { $subtract: ['$payout', '$amount'] } },
          totalBets: { $sum: 1 },
          biggestWin: { $max: { $subtract: ['$payout', '$amount'] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          totalWinnings: 1,
          totalBets: 1,
          biggestWin: 1
        }
      },
      {
        $sort: { totalWinnings: -1 }
      },
      {
        $limit: 50
      }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
    });
  }
});

// Verify round fairness
router.get('/verify/:roundId', async (req, res) => {
  try {
    const { roundId } = req.params;
    const { clientSeed } = req.query;

    const verification = await gameEngine.verifyRound(roundId, clientSeed);

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Error verifying round:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;