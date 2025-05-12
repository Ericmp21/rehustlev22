import { useSession, signOut } from 'next-auth/react';
import { requireAuthentication } from '../lib/auth';
import Head from 'next/head';

export default function Dashboard({ session }) {
  // We already have session from getServerSideProps, but useSession
  // is still used for client-side state management
  const { data: clientSession } = useSession();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Dashboard - RE Hustle V2</title>
        <meta name="description" content="Manage your real estate deals and analytics" />
      </Head>
      
      <header className="bg-gray-800 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-400">RE Hustle V2</h1>
          <div className="flex items-center">
            <span className="mr-4">{session.user.email}</span>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Welcome to RE Hustle V2!</h2>
          <p className="text-gray-300">
            Your real estate deal analysis platform. Use the tools below to analyze deals, 
            track your investments, and make data-driven decisions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 text-green-400">Analyze New Deal</h3>
            <p className="text-gray-300 mb-4">
              Enter property details to calculate ROI, cash flow, and Sniper Score.
            </p>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded">
              New Analysis
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 text-green-400">Saved Deals</h3>
            <p className="text-gray-300 mb-4">
              View and manage your saved property analyses.
            </p>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded">
              View Deals
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 text-green-400">Account Settings</h3>
            <p className="text-gray-300 mb-4">
              Manage your profile and application preferences.
            </p>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded">
              Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  return requireAuthentication(context);
}