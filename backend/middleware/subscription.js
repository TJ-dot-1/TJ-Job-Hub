import User from '../models/User.js';

// Middleware to check subscription limits
export const checkSubscriptionLimits = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId || req.user?.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const permission = user.canPerformAction(action);

      if (!permission.allowed) {
        return res.status(403).json({
          success: false,
          message: 'Subscription limit reached',
          reason: permission.reason,
          upgradeRequired: true,
          pricingUrl: '/pricing'
        });
      }

      // Attach user to request for later use
      req.subscriptionUser = user;
      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
};

// Middleware to increment usage after successful action
export const incrementUsage = (action) => {
  return async (req, res, next) => {
    // Store original send method
    const originalSend = res.send;

    res.send = function(data) {
      // Only increment if response is successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.subscriptionUser) {
        req.subscriptionUser.incrementUsage(action).catch(err => {
          console.error('Failed to increment usage:', err);
        });
      }

      // Call original send method
      originalSend.call(this, data);
    };

    next();
  };
};

// Combined middleware for actions that need both checks
export const subscriptionGuard = (action) => {
  return [checkSubscriptionLimits(action), incrementUsage(action)];
};

export default {
  checkSubscriptionLimits,
  incrementUsage,
  subscriptionGuard
};