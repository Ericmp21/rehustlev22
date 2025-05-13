import { getSession } from 'next-auth/react';
import Stripe from 'stripe';
import { getDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

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

    // Get user ID and email from request (or from session)
    const { userId, userEmail } = req.body;
    const email = userEmail || session.user.email;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Create a new Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'RE Hustle V2 - Professional Plan',
              description: 'Monthly subscription for RE Hustle V2 deal analysis software',
            },
            unit_amount: 4700, // $47.00 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      // Pass the customer ID through metadata for webhook processing
      metadata: {
        userId: userId.toString(),
      },
      success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/upgrade`,
    });

    // Return the session ID
    return res.status(200).json({
      id: checkoutSession.id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      message: 'Error creating checkout session',
      error: error.message
    });
  }
}