import express from 'express';
import stripe from '../config/stripe.js';
import { SUBSCRIPTION_PLANS } from '../config/stripe.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

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

export default router;