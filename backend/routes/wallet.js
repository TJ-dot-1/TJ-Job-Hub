import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// All wallet routes require authentication
router.use(verifyToken);

// Get wallet balance
router.get('/balance', async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('bettingProfile');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        balance: user.bettingProfile.balance,
        totalBets: user.bettingProfile.totalBets,
        totalWinnings: user.bettingProfile.totalWinnings,
        level: user.bettingProfile.level
      }
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get balance'
    });
  }
});

// Deposit funds (simplified - in production, integrate with payment gateway)
router.post('/deposit', async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deposit amount'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check deposit limits
    if (user.bettingProfile.lastDeposit) {
      const today = new Date();
      const lastDeposit = new Date(user.bettingProfile.lastDeposit);
      if (today.toDateString() === lastDeposit.toDateString()) {
        // Daily limit check (simplified)
        if (amount > user.bettingProfile.depositLimit) {
          return res.status(400).json({
            success: false,
            message: `Daily deposit limit exceeded (${user.bettingProfile.depositLimit})`
          });
        }
      }
    }

    // Create transaction
    const transaction = new Transaction({
      user: userId,
      type: 'deposit',
      amount,
      paymentMethod,
      status: 'completed' // In production, this would be pending until payment confirmation
    });
    await transaction.save();

    // Update user balance
    user.bettingProfile.balance += amount;
    user.bettingProfile.lastDeposit = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        transactionId: transaction._id,
        amount,
        newBalance: user.bettingProfile.balance
      }
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process deposit'
    });
  }
});

// Withdraw funds (simplified)
router.post('/withdraw', async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.bettingProfile.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Minimum withdrawal check
    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is 10'
      });
    }

    // Create transaction
    const transaction = new Transaction({
      user: userId,
      type: 'withdrawal',
      amount: -amount, // Negative for withdrawal
      paymentMethod,
      status: 'pending' // Withdrawals typically need approval
    });
    await transaction.save();

    // Deduct from balance (in production, hold until processed)
    user.bettingProfile.balance -= amount;
    await user.save();

    res.json({
      success: true,
      data: {
        transactionId: transaction._id,
        amount,
        newBalance: user.bettingProfile.balance,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal'
    });
  }
});

// Get transaction history
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    let filter = { user: userId };
    if (type) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
});

// Update betting settings
router.put('/settings', async (req, res) => {
  try {
    const { depositLimit, lossLimit, sessionTimeLimit, isBettingEnabled } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update settings
    if (depositLimit !== undefined) user.bettingProfile.depositLimit = depositLimit;
    if (lossLimit !== undefined) user.bettingProfile.lossLimit = lossLimit;
    if (sessionTimeLimit !== undefined) user.bettingProfile.sessionTimeLimit = sessionTimeLimit;
    if (isBettingEnabled !== undefined) user.bettingProfile.isBettingEnabled = isBettingEnabled;

    await user.save();

    res.json({
      success: true,
      data: user.bettingProfile
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

export default router;