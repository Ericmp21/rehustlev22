import Stripe from 'stripe';
import { getSession } from 'next-auth/react';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Get user from session
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in.' });
    }

    const { userId, email } = session.user;

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'RE Hustle Pro Subscription',
              description: 'Monthly subscription to RE Hustle Pro',
            },
            unit_amount: 4700, // $47.00 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/upgrade?canceled=true`,
      customer_email: email,
      metadata: {
        userId: userId,
      },
    });

    res.status(200).json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
}