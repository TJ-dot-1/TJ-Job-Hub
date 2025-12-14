import User from '../models/User.js';

// Middleware to check if user is allowed to bet
export const checkBettingAccess = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if betting is enabled for this user
    if (!user.bettingProfile.isBettingEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Betting is disabled for this account'
      });
    }

    // Check if user is verified (KYC) - temporarily disabled for testing
    // if (!user.bettingProfile.kycVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'KYC verification required for betting'
    //   });
    // }

    // Check session time limits
    if (user.bettingProfile.sessionTimeLimit > 0) {
      const sessionStart = user.bettingProfile.sessionStart || new Date();
      const sessionDuration = (new Date() - sessionStart) / 1000 / 60; // minutes

      if (sessionDuration > user.bettingProfile.sessionTimeLimit) {
        return res.status(403).json({
          success: false,
          message: 'Session time limit exceeded. Please take a break.'
        });
      }
    }

    // Attach user to request for easier access
    req.bettingUser = user;
    next();
  } catch (error) {
    console.error('Betting access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check deposit/withdrawal limits
export const checkTransactionLimits = (req, res, next) => {
  const user = req.bettingUser;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount'
    });
  }

  // Check daily deposit limit
  if (req.path.includes('/deposit')) {
    const today = new Date();
    const lastDeposit = user.bettingProfile.lastDeposit;

    if (lastDeposit && today.toDateString() === lastDeposit.toDateString()) {
      // Simplified: check if amount exceeds daily limit
      if (amount > user.bettingProfile.depositLimit) {
        return res.status(400).json({
          success: false,
          message: `Daily deposit limit (${user.bettingProfile.depositLimit}) exceeded`
        });
      }
    }
  }

  // Check loss limits for withdrawals
  if (req.path.includes('/withdraw')) {
    // Simplified loss limit check
    const recentLosses = user.bettingProfile.totalBets * 10 - user.bettingProfile.totalWinnings; // rough estimate
    if (recentLosses > user.bettingProfile.lossLimit) {
      return res.status(400).json({
        success: false,
        message: 'Loss limit reached. Please contact support.'
      });
    }
  }

  next();
};

// Rate limiting for betting actions
export const bettingRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis or similar)
  const userId = req.user._id.toString();
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 50; // Increased for development testing

  if (!global.bettingRateLimit) {
    global.bettingRateLimit = new Map();
  }

  const userRequests = global.bettingRateLimit.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many betting requests. Please slow down.'
    });
  }

  recentRequests.push(now);
  global.bettingRateLimit.set(userId, recentRequests);

  next();
};