import { getSession } from 'next-auth/react';
import Stripe from 'stripe';
import { getDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { updateSubscriptionStatus } from '../../lib/auth';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check user authentication
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get Stripe session ID from request
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Retrieve checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Ensure payment was successful
    if (checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Get the user ID from the session metadata
    const userId = checkoutSession.metadata?.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in session metadata' });
    }

    // Update the user's subscription status in MongoDB
    try {
      let userObjectId;
      
      try {
        // Try to convert string to ObjectId (for MongoDB)
        userObjectId = new ObjectId(userId);
      } catch (err) {
        // If not a valid ObjectId, use the string as is (for fallback storage)
        userObjectId = userId;
      }
      
      const db = await getDatabase();
      
      // Update user's subscription status
      const result = await db.collection('users').updateOne(
        { _id: userObjectId },
        { $set: { 
          is_subscribed: true,
          subscription_id: checkoutSession.subscription,
          subscription_status: 'active',
          subscription_updated_at: new Date()
        }}
      );
      
      if (result.modifiedCount === 0) {
        throw new Error('User not found or not updated');
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Subscription activated successfully' 
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        message: 'Error updating subscription status', 
        error: dbError.message 
      });
    }
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return res.status(500).json({
      message: 'Error verifying subscription',
      error: error.message
    });
  }
}