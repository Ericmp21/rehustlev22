import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function SubscriptionSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    // Skip if no session ID or already processed
    if (!session_id || success || error) return;

    async function verifySubscription() {
      try {
        // Call API to verify the subscription and update user status
        const response = await fetch('/api/verify-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: session_id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to verify subscription');
        }

        setSuccess(true);

        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 5000);
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    verifySubscription();
  }, [session_id, success, error, router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Head>
        <title>Subscription Successful - RE Hustle V2</title>
        <meta name="description" content="Your subscription to RE Hustle V2 has been successfully activated" />
      </Head>

      <div className="max-w-md w-full text-center">
        {loading ? (
          <div>
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold mb-4">Activating Your Subscription...</h1>
            <p className="text-gray-300">Please wait while we activate your account.</p>
          </div>
        ) : error ? (
          <div>
            <div className="text-red-400 text-5xl mb-6">❌</div>
            <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex flex-col space-y-4">
              <Link href="/upgrade">
                <span className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer inline-block">
                  Try Again
                </span>
              </Link>
              <Link href="/dashboard">
                <span className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded cursor-pointer inline-block">
                  Go to Dashboard
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-green-400 text-5xl mb-6">✅</div>
            <h1 className="text-2xl font-bold mb-4">Subscription Successful!</h1>
            <p className="text-gray-300 mb-6">
              Thank you for subscribing to RE Hustle V2. Your account has been upgraded to the Professional Plan.
            </p>
            <p className="text-gray-300 mb-8">
              You will be redirected to the dashboard in a few seconds...
            </p>
            <Link href="/dashboard">
              <span className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer inline-block">
                Go to Dashboard Now
              </span>
            </Link>
          </div>
        )}
      </div>
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

  return {
    props: {},
  };
}