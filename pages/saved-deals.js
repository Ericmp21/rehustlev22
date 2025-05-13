import { useState, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { requireAuthentication } from "../lib/auth";

export default function SavedDeals({ user }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load deals from MongoDB via API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals');
        
        if (!response.ok) {
          throw new Error(`Error fetching deals: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDeals(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setError('Failed to load deals. Using local storage as fallback.');
        
        // Fallback to localStorage
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

  // Handle deal deletion
  const deleteDeal = async (id) => {
    try {
      // If the deal has an _id, it's from MongoDB
      if (id.length > 10) {
        const response = await fetch(`/api/deals/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete deal: ${response.statusText}`);
        }
        
        // Update local state after successful deletion
        setDeals(deals.filter(deal => deal._id !== id));
      } else {
        // Fallback for localStorage deals
        const updatedDeals = deals.filter(deal => deal.id !== id);
        setDeals(updatedDeals);
        localStorage.setItem('savedDeals', JSON.stringify(updatedDeals));
      }
    } catch (err) {
      console.error('Error deleting deal:', err);
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
                  <Link href="/saved-deals" className="text-green-400 font-bold">
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
              <div key={deal.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="border-b border-gray-700 bg-gray-700/50 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{deal.address}</h3>
                    <p className="text-sm text-gray-400">
                      Analyzed on {new Date(deal.timestamp).toLocaleDateString()} at {new Date(deal.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      deal.sniperScore > 70 ? 'bg-green-900/50 text-green-400 border border-green-600' : 
                      deal.sniperScore >= 40 ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-600' : 'bg-red-900/50 text-red-400 border border-red-600'
                    }`}>
                      Sniper Score: {deal.sniperScore}
                    </span>
                    <button
                      onClick={() => deleteDeal(deal.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      aria-label="Delete deal"
                      title="Delete deal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Property type badge */}
                  <div className="mb-4">
                    <span className="inline-block bg-blue-900/40 text-blue-300 border border-blue-700 text-xs px-2 py-1 rounded-full">
                      {deal.propertyType || "Land"}
                    </span>
                  </div>
                  
                  {/* Display different fields based on property type */}
                  {(!deal.propertyType || deal.propertyType === "Land") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Purchase Price</p>
                          <p className="font-bold">${parseFloat(deal.purchase_price || deal.purchasePrice).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Market Value</p>
                          <p className="font-bold">${parseFloat(deal.market_value || deal.marketValue).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Recommended Offer</p>
                          <p className="font-bold">${deal.recommendedOffer}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Risk Level</p>
                          <p className={`font-bold ${
                            deal.riskLevel === 'Green' ? 'text-green-400' : 
                            deal.riskLevel === 'Yellow' ? 'text-yellow-400' : 'text-red-400'
                          }`}>{deal.riskLevel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Exit Strategy</p>
                          <p className="font-bold">{deal.exitStrategy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Seller Motivation</p>
                          <p className="font-bold">{deal.seller_motivation || deal.sellerMotivation}</p>
                        </div>
                      </div>
                      
                      {((deal.additional_notes || deal.notes) || (deal.zoning_notes || deal.zoningNotes)) && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          {(deal.additional_notes || deal.notes) && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-400 font-medium">Notes</p>
                              <p className="text-gray-300">{deal.additional_notes || deal.notes}</p>
                            </div>
                          )}
                          
                          {(deal.zoning_notes || deal.zoningNotes) && (
                            <div>
                              <p className="text-sm text-gray-400 font-medium">Zoning Notes</p>
                              <p className="text-gray-300">{deal.zoning_notes || deal.zoningNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  
                  {deal.propertyType === "Residential" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">ARV</p>
                          <p className="font-bold">${parseFloat(deal.arv).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Repair Costs</p>
                          <p className="font-bold">${parseFloat(deal.repair_costs).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Recommended Offer</p>
                          <p className="font-bold">${deal.recommendedOffer}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Risk Level</p>
                          <p className={`font-bold ${
                            deal.riskLevel === 'Green' ? 'text-green-400' : 
                            deal.riskLevel === 'Yellow' ? 'text-yellow-400' : 'text-red-400'
                          }`}>{deal.riskLevel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Exit Strategy</p>
                          <p className="font-bold">{deal.exitStrategy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Distress Signals</p>
                          <p className="font-bold">{deal.distress_signals || "None"}</p>
                        </div>
                      </div>
                      
                      {deal.additional_notes && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <div className="mb-3">
                            <p className="text-sm text-gray-400 font-medium">Notes</p>
                            <p className="text-gray-300">{deal.additional_notes}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {deal.propertyType === "Multi-Family" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Units</p>
                          <p className="font-bold">{deal.unit_count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Monthly Rent</p>
                          <p className="font-bold">${parseFloat(deal.monthly_rent_roll).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Expenses</p>
                          <p className="font-bold">${parseFloat(deal.expenses).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Risk Level</p>
                          <p className={`font-bold ${
                            deal.riskLevel === 'Green' ? 'text-green-400' : 
                            deal.riskLevel === 'Yellow' ? 'text-yellow-400' : 'text-red-400'
                          }`}>{deal.riskLevel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Exit Strategy</p>
                          <p className="font-bold">{deal.exitStrategy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Recommended Offer</p>
                          <p className="font-bold">${deal.recommendedOffer}</p>
                        </div>
                      </div>
                      
                      {deal.additional_notes && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <div className="mb-3">
                            <p className="text-sm text-gray-400 font-medium">Notes</p>
                            <p className="text-gray-300">{deal.additional_notes}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {deal.propertyType === "Commercial" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">NOI</p>
                          <p className="font-bold">${parseFloat(deal.noi).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Cap Rate</p>
                          <p className="font-bold">{deal.market_cap_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Recommended Offer</p>
                          <p className="font-bold">${deal.recommendedOffer}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Risk Level</p>
                          <p className={`font-bold ${
                            deal.riskLevel === 'Green' ? 'text-green-400' : 
                            deal.riskLevel === 'Yellow' ? 'text-yellow-400' : 'text-red-400'
                          }`}>{deal.riskLevel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Exit Strategy</p>
                          <p className="font-bold">{deal.exitStrategy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Vacancy Rate</p>
                          <p className="font-bold">{deal.vacancy_rate}%</p>
                        </div>
                      </div>
                      
                      {(deal.additional_notes || deal.lease_terms) && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          {deal.lease_terms && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-400 font-medium">Lease Terms</p>
                              <p className="text-gray-300">{deal.lease_terms}</p>
                            </div>
                          )}
                          
                          {deal.additional_notes && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-400 font-medium">Notes</p>
                              <p className="text-gray-300">{deal.additional_notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                    <Link 
                      href="/analyze-deal" 
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Analyze New Deal
                    </Link>
                  </div>
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
  // Use our enhanced authentication function that checks trial/subscription status
  // This will automatically redirect to login or upgrade pages as needed
  return await requireAuthentication(context);
}