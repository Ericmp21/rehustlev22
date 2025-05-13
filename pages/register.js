import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!name || !email || !password) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Call the register API endpoint with trial start date
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          trial_start_date: new Date().toISOString(), // Track trial start date
          is_subscribed: false, // Default to not subscribed
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Show success message
      setSuccess(true);

      // Sign in the user automatically with improved error handling
      setTimeout(async () => {
        console.log("Auto-login after registration for:", email);
        
        try {
          const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
            callbackUrl: '/dashboard', // Explicitly set callback URL
          });

          console.log("Auto-login response:", {
            ok: result?.ok,
            status: result?.status,
            hasError: !!result?.error,
            url: result?.url
          });

          if (result?.error) {
            console.error("Auto-login error:", result.error);
            throw new Error('Failed to sign in after registration');
          }

          // Use window.location for a full page reload to ensure session is properly set
          window.location.href = '/dashboard';
        } catch (err) {
          console.error("Error during auto-login:", err);
          setError('Account created but login failed. Please try logging in manually.');
          setLoading(false);
          // Keep success=true to show the success message, but also show error
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Head>
        <title>Start Free Trial - RE Hustle V2</title>
        <meta name="description" content="Create your free account and start your 7-day trial of RE Hustle V2" />
      </Head>

      {/* Left side - Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-3 text-green-400">Start Your Free Trial</h1>
            <p className="text-gray-300">Create your account to get 7 days of full access, no credit card required.</p>
          </div>

          {success ? (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-medium text-green-400 mb-2">Account Created Successfully!</h3>
              <p className="text-gray-300">Redirecting you to your dashboard...</p>
            </div>
          ) : (
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium">Password</label>
                  <input
                    type="password"
                    className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-400">Must be at least 6 characters</p>
                </div>

                <button
                  type="submit"
                  className={`w-full bg-green-500 hover:bg-green-600 transition text-white font-bold py-3 px-4 rounded-md text-lg ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Start My Free Trial'}
                </button>

                <p className="mt-4 text-center text-sm text-gray-400">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400 mb-2">Already have an account?</p>
                <Link href="/login" className="text-green-400 hover:underline font-medium">
                  Sign in to your account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Feature Highlights */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 p-10 flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-white">Everything you need to find profitable deals</h2>
            <p className="text-xl text-gray-300 mb-8">Start your 7-day free trial today and see why investors love RE Hustle V2.</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="text-green-400 text-xl mr-4">✓</div>
              <div>
                <h3 className="font-bold mb-1">Sniper Score Analysis</h3>
                <p className="text-gray-400">Our proprietary algorithm analyzes 25+ factors to score any deal</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-green-400 text-xl mr-4">✓</div>
              <div>
                <h3 className="font-bold mb-1">Multiple Property Types</h3>
                <p className="text-gray-400">Analyze residential, multi-family, commercial and land investments</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-green-400 text-xl mr-4">✓</div>
              <div>
                <h3 className="font-bold mb-1">CRM Integration</h3>
                <p className="text-gray-400">Connect with Podio, GoHighLevel, Notion and REI Reply</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-green-400 text-xl mr-4">✓</div>
              <div>
                <h3 className="font-bold mb-1">Unlimited Deal Analysis</h3>
                <p className="text-gray-400">No limits on how many properties you can evaluate</p>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">Professional Plan</h3>
              <div className="text-2xl font-bold">$47<span className="text-sm font-normal text-gray-400">/month</span></div>
            </div>
            <p className="text-gray-400 text-sm">After your 7-day free trial</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}