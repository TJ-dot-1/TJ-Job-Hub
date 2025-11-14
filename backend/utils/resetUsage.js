import User from '../models/User.js';
import cron from 'node-cron';

// Reset monthly usage counters for all users
export const resetMonthlyUsage = async () => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Find users whose last reset was in a different month
    const usersToReset = await User.find({
      'subscription.monthlyUsage.lastReset': {
        $lt: new Date(currentYear, currentMonth, 1)
      }
    });

    const resetCount = await User.updateMany(
      {
        'subscription.monthlyUsage.lastReset': {
          $lt: new Date(currentYear, currentMonth, 1)
        }
      },
      {
        $set: {
          'subscription.monthlyUsage.applications': 0,
          'subscription.monthlyUsage.adviceViews': 0,
          'subscription.monthlyUsage.jobPostings': 0,
          'subscription.monthlyUsage.lastReset': now
        }
      }
    );

    console.log(`✅ Reset monthly usage for ${resetCount.modifiedCount} users`);
    return resetCount.modifiedCount;
  } catch (error) {
    console.error('❌ Error resetting monthly usage:', error);
    throw error;
  }
};

// Schedule monthly reset on the 1st of each month at midnight
export const scheduleMonthlyReset = () => {
  // Cron expression: "0 0 1 * *" - At 00:00 on day-of-month 1
  cron.schedule('0 0 1 * *', async () => {
    console.log('🔄 Running monthly usage reset...');
    try {
      await resetMonthlyUsage();
      console.log('✅ Monthly usage reset completed');
    } catch (error) {
      console.error('❌ Monthly usage reset failed:', error);
    }
  });

  console.log('📅 Monthly usage reset scheduled for the 1st of each month');
};

// Manual reset function for testing/admin purposes
export const manualReset = async () => {
  console.log('🔄 Manual monthly usage reset initiated...');
  try {
    const count = await resetMonthlyUsage();
    console.log(`✅ Manual reset completed for ${count} users`);
    return count;
  } catch (error) {
    console.error('❌ Manual reset failed:', error);
    throw error;
  }
};

export default {
  resetMonthlyUsage,
  scheduleMonthlyReset,
  manualReset
};