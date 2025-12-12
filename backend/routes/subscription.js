import express from 'express';
import stripe from '../config/stripe.js';
import { SUBSCRIPTION_PLANS } from '../config/stripe.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { initiateSTKPush, querySTKPushStatus } from '../utils/mpesa.js';

const router = express.Router();

// Create subscription session
router.post('/create-session', verifyToken, async (req, res) => {
  try {
    const { planType, interval } = req.body; // planType: 'job_seeker' or 'employer', interval: 'monthly' or 'yearly'
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has an active subscription
    if (user.subscription.plan === 'pro' && (!user.subscription.expiresAt || user.subscription.expiresAt > new Date())) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    const plan = SUBSCRIPTION_PLANS[planType]?.[interval];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan type or interval' });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (user.subscription.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.subscription.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      user.subscription.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: plan.currency,
          product_data: {
            name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Pro Plan - ${interval.charAt(0).toUpperCase() + interval.slice(1)}`,
            description: `Unlock unlimited access for ${planType === 'job_seeker' ? 'job applications and career advice' : 'job postings and candidate access'}`
          },
          unit_amount: plan.amount * 100, // Stripe expects amount in cents
          recurring: {
            interval: plan.interval
          }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        userId: user._id.toString(),
        planType,
        interval
      }
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Create subscription session error:', error);
    res.status(500).json({ message: 'Failed to create subscription session' });
  }
});

// Get subscription status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isActive = user.subscription.plan === 'pro' && (!user.subscription.expiresAt || user.subscription.expiresAt > new Date());

    res.json({
      plan: user.subscription.plan,
      isActive,
      expiresAt: user.subscription.expiresAt,
      stripeCustomerId: user.subscription.stripeCustomerId,
      monthlyUsage: user.subscription.monthlyUsage
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    res.json({ message: 'Subscription will be cancelled at the end of the billing period' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// Helper functions for webhook handlers
async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata.userId;
  const user = await User.findById(userId);

  if (user) {
    user.subscription.plan = 'pro';
    user.subscription.stripeSubscriptionId = session.subscription;
    user.subscription.expiresAt = null; // Managed by Stripe
    await user.save();
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  // Subscription is active and paid
  const customerId = invoice.customer;
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });

  if (user) {
    user.subscription.plan = 'pro';
    user.subscription.expiresAt = null; // Keep active until cancelled
    await user.save();
  }
}

async function handleInvoicePaymentFailed(invoice) {
  // Payment failed - could implement grace period or immediate downgrade
  console.log('Payment failed for invoice:', invoice.id);
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });

  if (user) {
    user.subscription.plan = 'free';
    user.subscription.stripeSubscriptionId = null;
    user.subscription.expiresAt = null;
    await user.save();
  }
}

// M-Pesa payment endpoint
router.post('/mpesa-payment', verifyToken, async (req, res) => {
  try {
    const { planType, interval, phoneNumber } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has an active subscription
    if (user.subscription.plan === 'pro' && (!user.subscription.expiresAt || user.subscription.expiresAt > new Date())) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    const plan = SUBSCRIPTION_PLANS[planType]?.[interval];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan type or interval' });
    }

    // Initiate M-Pesa STK Push
    try {
      // Convert USD to KES (approximate rate: 1 USD = 130 KES)
      const amountInKES = Math.round(plan.amount * 130);

      const stkPushResponse = await initiateSTKPush(
        phoneNumber,
        amountInKES,
        `Subscription-${planType}-${interval}`,
        `Payment for ${planType} Pro Plan - ${interval}`
      );

      // Store pending transaction
      user.subscription.pendingTransaction = {
        checkoutRequestId: stkPushResponse.CheckoutRequestID,
        merchantRequestId: stkPushResponse.MerchantRequestID,
        planType,
        interval,
        amount: amountInKES,
        phoneNumber,
        initiatedAt: new Date(),
        status: 'pending'
      };
      await user.save();

      res.json({
        checkoutRequestId: stkPushResponse.CheckoutRequestID,
        merchantRequestId: stkPushResponse.MerchantRequestID,
        message: 'M-Pesa STK Push initiated successfully. Please check your phone.'
      });
    } catch (mpesaError) {
      console.error('M-Pesa STK Push failed:', mpesaError);
      res.status(500).json({ message: 'Failed to initiate M-Pesa payment. Please try again.' });
    }
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    res.status(500).json({ message: 'Failed to initiate M-Pesa payment' });
  }
});

// Check payment status
router.post('/payment-status', verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if transaction matches
    if (user.subscription.pendingTransaction?.checkoutRequestId === transactionId) {
      try {
        // Query M-Pesa for transaction status
        const queryResponse = await querySTKPushStatus(transactionId);

        if (queryResponse.ResponseCode === '0' && queryResponse.ResultCode === '0') {
          // Payment successful
          const { planType, interval } = user.subscription.pendingTransaction;
          const plan = SUBSCRIPTION_PLANS[planType]?.[interval];

          user.subscription.plan = 'pro';
          user.subscription.expiresAt = interval === 'yearly' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;
          user.subscription.pendingTransaction = null;
          await user.save();

          return res.json({ status: 'completed' });
        } else if (queryResponse.ResultCode === '1032' || queryResponse.ResultCode === '1') {
          // Transaction cancelled or failed
          user.subscription.pendingTransaction = null;
          await user.save();
          return res.json({ status: 'failed' });
        } else {
          // Still processing
          return res.json({ status: 'pending' });
        }
      } catch (queryError) {
        console.error('M-Pesa query error:', queryError);
        return res.json({ status: 'pending' }); // Assume pending if query fails
      }
    }

    res.json({ status: 'not_found' });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
});

// M-Pesa callback handler
router.post('/mpesa-callback', async (req, res) => {
  try {
    const callbackData = req.body;

    console.log('M-Pesa Callback:', JSON.stringify(callbackData, null, 2));

    // Check if payment was successful
    if (callbackData.Body?.stkCallback?.ResultCode === 0) {
      const checkoutRequestId = callbackData.Body.stkCallback.CheckoutRequestID;
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata?.Item || [];

      // Extract transaction details
      const amount = callbackMetadata.find(item => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber')?.Value;

      // Find user with this checkout request ID
      const user = await User.findOne({ 'subscription.pendingTransaction.checkoutRequestId': checkoutRequestId });

      if (user && user.subscription.pendingTransaction) {
        const { planType, interval } = user.subscription.pendingTransaction;
        const plan = SUBSCRIPTION_PLANS[planType]?.[interval];

        // Update user subscription
        user.subscription.plan = 'pro';
        user.subscription.expiresAt = interval === 'yearly' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;
        user.subscription.pendingTransaction.status = 'completed';
        user.subscription.pendingTransaction.completedAt = new Date();
        user.subscription.pendingTransaction.mpesaReceiptNumber = mpesaReceiptNumber;
        user.subscription.pendingTransaction.transactionDate = transactionDate;

        await user.save();

        console.log(`M-Pesa payment completed for user ${user._id}: ${mpesaReceiptNumber}`);
      }
    } else {
      // Payment failed or cancelled
      const checkoutRequestId = callbackData.Body?.stkCallback?.CheckoutRequestID;
      if (checkoutRequestId) {
        const user = await User.findOne({ 'subscription.pendingTransaction.checkoutRequestId': checkoutRequestId });
        if (user) {
          user.subscription.pendingTransaction.status = 'failed';
          user.subscription.pendingTransaction.failedAt = new Date();
          user.subscription.pendingTransaction.failureReason = callbackData.Body?.stkCallback?.ResultDesc || 'Payment failed';
          await user.save();

          console.log(`M-Pesa payment failed for user ${user._id}: ${callbackData.Body?.stkCallback?.ResultDesc}`);
        }
      }
    }

    // Always respond with success to M-Pesa
    res.json({ ResultCode: 0, ResultDesc: 'Callback received successfully' });
  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    // Still respond with success to avoid retries
    res.json({ ResultCode: 0, ResultDesc: 'Callback processing completed' });
  }
});

export default router;