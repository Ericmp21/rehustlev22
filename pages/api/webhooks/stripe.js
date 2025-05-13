import Stripe from 'stripe';
import { buffer } from 'micro';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Disable Next.js body parsing to get the raw body for Stripe webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Get the raw body for verification
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).send('Missing Stripe signature');
    }

    // Verify the webhook signature
    // Note: You would need to set the STRIPE_WEBHOOK_SECRET in your environment variables
    // Get this from the Stripe Dashboard: https://dashboard.stripe.com/webhooks
    let event;
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn('STRIPE_WEBHOOK_SECRET is not set - skipping signature verification');
        event = JSON.parse(rawBody.toString());
      } else {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      }
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

/**
 * Handle checkout.session.completed event
 * Called when a checkout is successful
 */
async function handleCheckoutSessionCompleted(checkoutSession) {
  // Only handle subscription checkouts
  if (checkoutSession.mode !== 'subscription') {
    return;
  }

  try {
    // Get the user ID from metadata
    const userId = checkoutSession.metadata?.userId;
    if (!userId) {
      console.error('No user ID found in session metadata');
      return;
    }

    // Get customer and subscription details
    const subscription = await stripe.subscriptions.retrieve(
      checkoutSession.subscription
    );

    const db = await getDatabase();

    let userObjectId;
    try {
      // Try to convert string to ObjectId (for MongoDB)
      userObjectId = new ObjectId(userId);
    } catch (err) {
      // If it's not a valid ObjectId, use the string as is
      userObjectId = userId;
    }

    // Update user subscription information
    const result = await db.collection('users').updateOne(
      { _id: userObjectId },
      {
        $set: {
          is_subscribed: true,
          stripe_customer_id: checkoutSession.customer,
          stripe_subscription_id: checkoutSession.subscription,
          subscription_status: subscription.status,
          subscription_updated_at: new Date(),
          subscription_period_end: new Date(subscription.current_period_end * 1000),
        },
      }
    );

    if (result.modifiedCount === 0) {
      console.error(`User ${userId} not found or not updated`);
    } else {
      console.log(`User ${userId} subscription updated successfully`);
    }
  } catch (error) {
    console.error('Error processing checkout.session.completed:', error);
  }
}

/**
 * Handle customer.subscription.updated event
 * Called when a subscription is updated (e.g., renewed, changed plan)
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    const db = await getDatabase();
    
    // Find the user with this subscription
    const user = await db.collection('users').findOne({
      stripe_subscription_id: subscription.id,
    });

    if (!user) {
      console.error(`No user found with subscription ID ${subscription.id}`);
      return;
    }

    // Update subscription information
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          is_subscribed: subscription.status === 'active',
          subscription_status: subscription.status,
          subscription_updated_at: new Date(),
          subscription_period_end: new Date(subscription.current_period_end * 1000),
        },
      }
    );

    if (result.modifiedCount === 0) {
      console.error(`Failed to update subscription for user ${user._id}`);
    } else {
      console.log(`Subscription updated for user ${user._id}`);
    }
  } catch (error) {
    console.error('Error processing subscription update:', error);
  }
}

/**
 * Handle customer.subscription.deleted event
 * Called when a subscription is canceled or expires
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    const db = await getDatabase();
    
    // Find the user with this subscription
    const user = await db.collection('users').findOne({
      stripe_subscription_id: subscription.id,
    });

    if (!user) {
      console.error(`No user found with subscription ID ${subscription.id}`);
      return;
    }

    // Update subscription information
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          is_subscribed: false,
          subscription_status: 'canceled',
          subscription_updated_at: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      console.error(`Failed to update subscription for user ${user._id}`);
    } else {
      console.log(`Subscription canceled for user ${user._id}`);
    }
  } catch (error) {
    console.error('Error processing subscription deletion:', error);
  }
}