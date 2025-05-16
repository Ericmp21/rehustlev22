import { useState, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { requireAuthentication } from "../lib/auth";

export default function SavedDeals({ user }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals');

        if (!response.ok) {
          const errMsg = await response.json();
          throw new Error(`Error fetching deals: ${response.statusText}`);
        }

        const data = await response.json();
        setDeals(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load deals: ' + err.message + '. Using local storage as fallback.');
        if (typeof window !== 'undefined') {
          const savedDeals = localStorage.getItem('savedDeals') 
            ? JSON.parse(localStorage.getItem('savedDeals')) 
            : [];
          setDeals(savedDeals);
          setLoading(false);
        }
      }
    };

    fetchDeals();
  }, []);

  const deleteDeal = async (id) => {
    try {
      if (id.length > 10) {
        const response = await fetch(`/api/deals/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete deal: ${response.statusText}`);
        }

        setDeals(deals.filter(deal => deal._id !== id));
      } else {
        const updatedDeals = deals.filter(deal => deal.id !== id);
        setDeals(updatedDeals);
        localStorage.setItem('savedDeals', JSON.stringify(updatedDeals));
      }
    } catch (err) {
      alert('Failed to delete deal. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Saved Deals - RE Hustle V2</title>
        <meta name="description" content="View your saved real estate deals" />
      </Head>

      <header className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-green-400">RE Hustle V2</h1>
            <nav>
              <ul className="flex space-x-4">
                <li><Link href="/dashboard" className="hover:text-green-400">Dashboard</Link></li>
                <li><Link href="/analyze-deal" className="hover:text-green-400">Analyze Deal</Link></li>
                <li><Link href="/saved-deals" className="text-green-400 font-bold">Saved Deals</Link></li>
                <li><Link href="/account" className="hover:text-green-400">Account</Link></li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span>{user?.email}</span>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Your Saved Deals</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-gray-200 rounded-full border-t-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 p-4 mb-6 rounded-lg">
            <p className="text-red-300 mb-2 font-medium">Error</p>
            <p className="text-white">{error}</p>
          </div>
        ) : deals.length > 0 ? (
          <div className="grid gap-6">
            {deals.map((deal) => (
              <div key={deal._id || deal.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="border-b border-gray-700 bg-gray-700/50 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{deal.propertyAddress || deal.address || 'Unknown Address'}</h3>
                    <p className="text-sm text-gray-400">
                      Analyzed on {new Date(deal.timestamp).toString() !== 'Invalid Date' ? new Date(deal.timestamp).toLocaleDateString() : 'Invalid Date'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      deal.sniperScore > 70 ? 'bg-green-900/50 text-green-400 border border-green-600' : 
                      deal.sniperScore >= 40 ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-600' : 'bg-red-900/50 text-red-400 border border-red-600'
                    }`}>
                      Sniper Score: {isNaN(deal.sniperScore) ? 'N/A' : deal.sniperScore}
                    </span>
                    <button onClick={() => deleteDeal(deal._id || deal.id)} className="text-red-400 hover:text-red-300 p-1" aria-label="Delete deal">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="inline-block bg-blue-900/40 text-blue-300 border border-blue-700 text-xs px-2 py-1 rounded-full">
                      {deal.propertyType || "Land"}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 font-medium">Notes</p>
                    <p className="text-gray-300">{deal.notes || deal.additional_notes || 'No notes provided.'}</p>
                  </div>
                  <Link href="/analyze-deal" className="text-blue-400 hover:text-blue-300 block mt-4">Analyze New Deal</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded text-center">
            <p>You don't have any saved deals yet.</p>
            <Link href="/analyze-deal" className="inline-block mt-4 bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
              Analyze Your First Deal
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  return await requireAuthentication(context);
}
