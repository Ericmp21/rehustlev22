import { useState } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { isTrialActive, getTrialStatus } from '../lib/auth';

export default function Upgrade({ user, trialStatus }) {
  const router = useRouter();
  const { canceled } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Function to handle subscription checkout
  const handleSubscribe = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>Upgrade to Pro - RE Hustle V2</title>
        <meta name="description" content="Upgrade to RE Hustle Pro to unlock all features" />
      </Head>
      
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-green-400">RE Hustle V2</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/dashboard" className="hover:text-green-400">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/analyze-deal" className="hover:text-green-400">
                    Analyze Deal
                  </Link>
                </li>
                <li>
                  <Link href="/saved-deals" className="hover:text-green-400">
                    Saved Deals
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-green-400">
                    Account
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div>
            <Link href="/dashboard" className="text-gray-300 hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {canceled && (
          <div className="bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-300">
                  Your payment was canceled. You can try again when you're ready.
                </p>
              </div>
            </div>
          </div>
        )}
      
        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-white mb-4">Upgrade to RE Hustle Pro</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get unlimited access to our powerful deal analysis tools and take your real estate investing to the next level.
            </p>
          </div>
          
          {user.isSubscribed ? (
            <div className="bg-gray-800 rounded-lg p-8 shadow-xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-800 mb-6">
                <svg className="w-8 h-8 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">You're already a Pro member!</h2>
              <p className="text-lg text-gray-300 mb-6">
                Your subscription is active and you have full access to all features.
              </p>
              <div className="bg-gray-700 rounded-lg p-4 max-w-md mx-auto mb-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Subscription Status</p>
                    <p className="mt-1 text-sm text-gray-200 capitalize">{user.subscriptionStatus || 'active'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Next Billing Date</p>
                    <p className="mt-1 text-sm text-gray-200">{formatDate(user.subscriptionPeriodEnd)}</p>
                  </div>
                </div>
              </div>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
              <div className="px-6 py-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">RE Hustle Pro</h2>
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-extrabold text-white">$47</span>
                  <span className="ml-1.5 text-xl text-gray-400">/month</span>
                </div>
                
                {!trialStatus.isActive && (
                  <p className="mt-2 text-red-400">
                    Your free trial has expired
                  </p>
                )}
                
                {trialStatus.isActive && (
                  <p className="mt-2 text-blue-400">
                    Your trial expires on {formatDate(trialStatus.expiresAt)}
                  </p>
                )}
                
                <ul className="mt-8 space-y-4 text-left">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Unlimited property deal analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Advanced Sniper Score™ algorithm</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">CRM integration (Podio, GoHighLevel, Notion)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Unlimited deal storage</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Cancel anytime</span>
                  </li>
                </ul>
                
                <div className="mt-10">
                  <button 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className={`w-full px-6 py-4 border border-transparent text-lg font-medium rounded-md text-white ${
                      isLoading ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Upgrade Now'
                    )}
                  </button>
                </div>
                
                <p className="mt-4 text-sm text-gray-400">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Get server-side props to access user and trial status
export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  // Redirect to login if not authenticated
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Get the user's trial status
  const trialActive = await isTrialActive(session.user.userId);
  const trialStatus = await getTrialStatus(session.user.userId);

  return {
    props: {
      user: session.user,
      trialStatus: trialStatus,
    },
  };
}