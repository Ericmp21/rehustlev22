import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // If loading, display loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  return (
    <>
      <Head>
        <title>Dashboard | RE Hustle</title>
        <meta name="description" content="Manage your real estate investments and analyze new deals." />
      </Head>
      
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header/Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">RE Hustle</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link href="/dashboard">
                    <a className="border-green-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/analyze-deal">
                    <a className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Analyze Deal
                    </a>
                  </Link>
                  <Link href="/saved-deals">
                    <a className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Saved Deals
                    </a>
                  </Link>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                      {session.user.email}
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main content */}
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  
                  {/* Quick Stats Card */}
                  <div className="card">
                    <div className="card-header">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Stats</h2>
                    </div>
                    <div className="card-body">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Saved Deals</dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white">0</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Analyzed This Month</dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white">0</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{session.user.plan || 'Free'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  {/* Recent Activity Card */}
                  <div className="card">
                    <div className="card-header">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
                    </div>
                    <div className="card-body">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity yet.</p>
                      <div className="mt-4">
                        <Link href="/analyze-deal">
                          <a className="btn-primary text-sm inline-block">Analyze New Deal</a>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subscription Card */}
                  <div className="card">
                    <div className="card-header">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Subscription</h2>
                    </div>
                    <div className="card-body">
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{session.user.plan || 'Free'} Plan</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {session.user.plan === 'premium' 
                          ? 'Unlimited deal analysis and advanced features.'
                          : 'Limited to 5 deal analyses per month.'}
                      </p>
                      {session.user.plan !== 'premium' && (
                        <div className="mt-4">
                          <button className="btn-primary text-sm">Upgrade to Premium</button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}