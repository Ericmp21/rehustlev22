import { getSession, signOut } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";

export default function Dashboard({ user }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Dashboard - RE Hustle V2</title>
        <meta name="description" content="Access your real estate investment tools" />
      </Head>
      
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-green-400">RE Hustle V2</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/dashboard" className="text-green-400 font-bold">
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
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span>{user?.email}</span>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Welcome to Your Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-green-400">Analyze New Deal</h3>
              <p className="text-gray-300 mb-4">
                Calculate the Sniper Score for a potential land deal and get recommendations.
              </p>
              <Link 
                href="/analyze-deal" 
                className="block w-full bg-green-500 hover:bg-green-600 text-center py-2 rounded font-medium"
              >
                Start Analysis
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-green-400">Saved Deals</h3>
              <p className="text-gray-300 mb-4">
                View and manage your previously analyzed real estate deals.
              </p>
              <Link 
                href="/saved-deals"
                className="block w-full bg-green-500 hover:bg-green-600 text-center py-2 rounded font-medium"
              >
                View Saved Deals
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-green-400">Account Settings</h3>
              <p className="text-gray-300 mb-4">
                Update your profile information and notification preferences.
              </p>
              <button 
                className="block w-full bg-gray-600 hover:bg-gray-700 text-center py-2 rounded font-medium"
                disabled
              >
                Coming Soon
              </button>
            </div>
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
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
}