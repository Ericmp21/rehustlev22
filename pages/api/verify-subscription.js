import Stripe from 'stripe';
import { getSession } from 'next-auth/react';
import { getDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { updateSubscriptionStatus } from '../../lib/auth';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in.' });
    }

    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session ID' });
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Verify the session belongs to this user
    if (!checkoutSession || !checkoutSession.metadata?.userId || 
        checkoutSession.metadata.userId !== session.user.userId) {
      return res.status(403).json({ error: 'Invalid session' });
    }

    // Check if payment was successful
    if (checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment has not been completed' });
    }

    const db = await getDatabase();

    let userObjectId;
    try {
      // Try to convert string to ObjectId (for MongoDB)
      userObjectId = new ObjectId(session.user.userId);
    } catch (err) {
      // If it's not a valid ObjectId, use the string as is
      userObjectId = session.user.userId;
    }

    // Update user subscription information
    const result = await db.collection('users').updateOne(
      { _id: userObjectId },
      {
        $set: {
          is_subscribed: true,
          stripe_customer_id: checkoutSession.customer,
          stripe_subscription_id: checkoutSession.subscription,
          subscription_status: 'active',
          subscription_updated_at: new Date(),
          // We don't have period_end yet from checkout session, 
          // but it will be updated by the webhook
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to update subscription status' });
    }

    // Also update the session object so the user sees their updated status immediately
    await updateSubscriptionStatus(session.user.userId, true);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
}