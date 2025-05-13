import { useState, useEffect } from 'react';
import { getSession, signOut } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';
import Link from 'next/link';
import { getTrialStatus } from '../lib/auth';

// Load Stripe outside of component render to avoid recreating Stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Upgrade({ user, trialStatus }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle subscription checkout
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create checkout session on the server
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const session = await response.json();

      if (!response.ok) {
        throw new Error(session.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Upgrade Your Account - RE Hustle V2</title>
        <meta name="description" content="Upgrade to the full version of RE Hustle V2 and continue analyzing real estate deals" />
      </Head>

      {/* Navigation */}
      <nav className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <span className="text-2xl font-bold text-green-400 cursor-pointer">RE Hustle V2</span>
          </Link>
          <div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-300 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {trialStatus.isActive 
                ? 'Your Free Trial is Active'
                : 'Your Free Trial Has Ended'}
            </h1>
            
            <p className="text-xl text-gray-300 mb-4">
              {trialStatus.isActive
                ? `You have ${trialStatus.daysRemaining} days remaining in your trial. Upgrade now to ensure uninterrupted access.`
                : 'Subscribe now to continue analyzing real estate deals with RE Hustle V2.'}
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Professional Plan</h2>
                  <p className="text-gray-300 mt-2">Full access to all features</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    $47<span className="text-lg font-normal text-gray-400">/month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="font-bold mb-4">Includes:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Unlimited deal analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>All property types (residential, multi-family, commercial, land)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Advanced Sniper Score algorithm</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>CRM integration (Podio, GoHighLevel, Notion, REI Reply)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Deal tracking and management</span>
                </li>
              </ul>

              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className={`w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg mb-4 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </button>

              <p className="text-center text-gray-400 text-sm">
                Secure payment processing by Stripe. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-green-400 text-4xl mb-4">"</div>
            <p className="text-lg mb-6 italic">
              RE Hustle has completely transformed how I analyze potential deals. The subscription pays
              for itself with just one good deal - and I found three in my first month using it!
            </p>
            <div>
              <p className="font-bold">Michael T.</p>
              <p className="text-gray-400">Real Estate Investor, Chicago</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400">
              Questions about your subscription? <a href="#" className="text-green-400 hover:underline">Contact our support team</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  try {
    // Get trial status
    const db = await import('../lib/mongodb').then(module => module.getDatabase());
    const user = await db.collection('users').findOne({ email: session.user.email });
    
    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    
    // If user is already subscribed, redirect to dashboard
    if (user.is_subscribed) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }
    
    // Calculate trial status
    const trialStartDate = user.trial_start_date ? new Date(user.trial_start_date) : new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    const currentDate = new Date();
    const isActive = currentDate < trialEndDate;
    
    // Calculate days remaining
    const diffTime = trialEndDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, diffDays);
    
    return {
      props: {
        user: {
          ...session.user,
          id: user._id.toString(), // Convert ObjectId to string
        },
        trialStatus: {
          isActive,
          isSubscribed: false,
          trialStartDate: trialStartDate.toISOString(),
          trialEndDate: trialEndDate.toISOString(),
          daysRemaining,
        }
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Default trial status on error
    return {
      props: {
        user: session.user,
        trialStatus: {
          isActive: false,
          isSubscribed: false,
          daysRemaining: 0,
          error: 'Could not verify trial status'
        }
      },
    };
  }
}