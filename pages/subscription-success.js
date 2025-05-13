import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Verify the subscription was successful
  async function verifySubscription() {
    if (!session_id) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session_id }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Your subscription has been activated successfully!');
      } else {
        setIsSuccess(false);
        setMessage(data.error || 'Failed to verify your subscription. Please contact support.');
      }
    } catch (error) {
      console.error('Subscription verification error:', error);
      setIsSuccess(false);
      setMessage('An error occurred while verifying your subscription. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    verifySubscription();
  }, [session_id]);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>Subscription Success - RE Hustle V2</title>
        <meta name="description" content="Your subscription has been processed" />
      </Head>
      
      <main className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin h-12 w-12 border-4 border-gray-200 rounded-full border-t-green-500 mb-4"></div>
              <h2 className="text-xl font-medium text-gray-200">Verifying your subscription...</h2>
            </div>
          ) : isSuccess ? (
            <>
              <div className="rounded-full bg-green-800 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Thank You!</h1>
              <p className="text-xl text-gray-300 mb-8">{message}</p>
              <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
                <h2 className="text-xl font-semibold text-green-400 mb-4">Your RE Hustle Pro Benefits</h2>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Unlimited deal analysis with our proprietary Sniper Score™</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Advanced CRM integrations to streamline your workflow</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Priority customer support for all your questions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Access to future premium features at no extra cost</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  Go to Dashboard
                </Link>
                <Link href="/analyze-deal" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-100">
                  Analyze a Deal
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-red-800 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Subscription Verification Failed</h1>
              <p className="text-xl text-gray-300 mb-8">{message}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/upgrade" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Link>
                <Link href="/dashboard" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-100">
                  Back to Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Server-side props to ensure we have session data
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

  return {
    props: { },
  };
}