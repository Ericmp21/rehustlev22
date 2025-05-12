import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function SavedDeals() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Mock data for saved deals (in a real app, this would come from an API)
  const [savedDeals, setSavedDeals] = useState([]);
  
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
        <title>Saved Deals | RE Hustle</title>
        <meta name="description" content="View and manage your saved real estate deals and analyses." />
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
                    <a className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/analyze-deal">
                    <a className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Analyze Deal
                    </a>
                  </Link>
                  <Link href="/saved-deals">
                    <a className="border-green-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Saved Deals
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main content */}
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saved Deals</h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                {savedDeals.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {savedDeals.map((deal) => (
                      <div key={deal.id} className="card">
                        <div className="card-header flex justify-between items-center">
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{deal.propertyName}</h2>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              deal.sniperScore >= 80 ? 'bg-green-100 text-green-800' :
                              deal.sniperScore >= 70 ? 'bg-green-100 text-green-800' :
                              deal.sniperScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              deal.sniperScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {deal.sniperScore} Score
                          </span>
                        </div>
                        <div className="card-body">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{deal.address}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Purchase</p>
                              <p className="text-sm font-medium">${deal.purchasePrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">ARV</p>
                              <p className="text-sm font-medium">${deal.afterRepairValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Cash Flow</p>
                              <p className="text-sm font-medium">${deal.monthlyCashFlow.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">CoC Return</p>
                              <p className="text-sm font-medium">{deal.cashOnCashReturn.toFixed(2)}%</p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-between">
                            <Link href={`/deal/${deal.id}`}>
                              <a className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">View Details</a>
                            </Link>
                            <button
                              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => {
                                const confirmed = confirm('Are you sure you want to delete this deal?');
                                if (confirmed) {
                                  setSavedDeals(savedDeals.filter(d => d.id !== deal.id));
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">No saved deals yet</h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400 mx-auto">
                        <p>You haven't saved any deals yet. Analyze a deal and save it to see it here.</p>
                      </div>
                      <div className="mt-5">
                        <Link href="/analyze-deal">
                          <a className="btn-primary">Analyze a Deal</a>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}