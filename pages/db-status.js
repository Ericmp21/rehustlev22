import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

export default function DbStatus({ user }) {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkDatabase() {
      try {
        // Check database connectivity through our test API
        const response = await fetch('/api/auth/test-connection');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setDbStatus(data);
        setLoading(false);
      } catch (err) {
        console.error('Error checking DB:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    checkDatabase();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>Database Status - RE Hustle V2</title>
        <meta name="description" content="Check database connectivity status" />
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
          <div className="flex items-center space-x-4">
            <span>{user?.email || 'Not logged in'}</span>
            {user && (
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Database Status</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-gray-200 rounded-full border-t-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
            <h3 className="font-bold text-red-400 mb-2">Error</h3>
            <p>{error}</p>
          </div>
        ) : dbStatus ? (
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${dbStatus.mongodb.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                MongoDB Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="font-medium">Connection</span>
                  <span className={`font-bold ${dbStatus.mongodb.connected ? 'text-green-400' : 'text-red-400'}`}>
                    {dbStatus.mongodb.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="border-b border-gray-700 pb-2">
                  <span className="font-medium">Collections</span>
                  {dbStatus.mongodb.collections.length > 0 ? (
                    <ul className="mt-2 pl-4 list-disc">
                      {dbStatus.mongodb.collections.map(collection => (
                        <li key={collection}>{collection}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-gray-400">No collections found</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${dbStatus.auth.isAuthenticated ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                Authentication Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="font-medium">Session</span>
                  <span className={`font-bold ${dbStatus.auth.isAuthenticated ? 'text-green-400' : 'text-gray-400'}`}>
                    {dbStatus.auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                  </span>
                </div>
                
                {dbStatus.auth.session && (
                  <div className="border-b border-gray-700 pb-2">
                    <span className="font-medium">User</span>
                    <div className="mt-2 text-gray-300">
                      <p><span className="text-gray-400">ID:</span> {dbStatus.auth.session.userId}</p>
                      <p><span className="text-gray-400">Email:</span> {dbStatus.auth.session.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Environment Configuration</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="font-medium">MongoDB URI</span>
                  <span className={`font-bold ${dbStatus.env.mongodb_configured ? 'text-green-400' : 'text-red-400'}`}>
                    {dbStatus.env.mongodb_configured ? 'Configured' : 'Missing'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="font-medium">NextAuth Secret</span>
                  <span className={`font-bold ${dbStatus.env.nextauth_configured ? 'text-green-400' : 'text-red-400'}`}>
                    {dbStatus.env.nextauth_configured ? 'Configured' : 'Missing'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="font-medium">Node Environment</span>
                  <span className="font-bold">{dbStatus.env.node_env}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Link href="/dashboard" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-medium">
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <p>No database information available</p>
          </div>
        )}
      </main>
    </div>
  );
}

// This page doesn't need authentication protection
export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  return {
    props: {
      user: session?.user || null,
    },
  };
}