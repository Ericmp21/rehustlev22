import { useState, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { requireAuthentication } from "../lib/auth";

export default function Account({ user, trialStatus }) {
  const [accountData, setAccountData] = useState({
    fullName: "",
    phoneNumber: "",
    preferredCRM: "None",
    crmAPIKey: "",
    syncAutomatically: false
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Load account data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('accountData') 
        ? JSON.parse(localStorage.getItem('accountData')) 
        : null;
      
      if (savedData) {
        setAccountData(savedData);
      }
      
      setLoading(false);
    }
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAccountData({
      ...accountData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('accountData', JSON.stringify(accountData));
    
    // Show success message
    setSaveSuccess(true);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>Account Settings - RE Hustle V2</title>
        <meta name="description" content="Manage your account and CRM integrations" />
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
                  <Link href="/account" className="text-green-400 font-bold">
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
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-gray-200 rounded-full border-t-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Subscription Status Section */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                <h3 className="text-xl font-semibold mb-4 text-green-400">Subscription Status</h3>
                
                {user.isSubscribed ? (
                  <div className="bg-gray-700 border-l-4 border-green-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-300">
                          You have an active subscription to RE Hustle Pro.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : trialStatus.isActive ? (
                  <div className="bg-gray-700 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-300">
                          You are currently in your 7-day free trial, which expires on {formatDate(trialStatus.expiresAt)}.
                        </p>
                        <p className="text-sm text-blue-300 mt-1">
                          <Link href="/upgrade" className="font-medium underline hover:text-blue-200">
                            Upgrade now
                          </Link> to continue using all features after your trial ends.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 border-l-4 border-red-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-300">
                          Your free trial has expired.
                        </p>
                        <p className="text-sm text-red-300 mt-1">
                          <Link href="/upgrade" className="font-medium underline hover:text-red-200">
                            Upgrade now
                          </Link> to continue using all features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {user.isSubscribed && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Subscription Status</p>
                        <p className="mt-1 text-sm text-gray-200 capitalize">{user.subscriptionStatus || 'active'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Next Billing Date</p>
                        <p className="mt-1 text-sm text-gray-200">{formatDate(user.subscriptionPeriodEnd)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link 
                        href="#" 
                        className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Please contact support to manage your subscription.');
                        }}
                      >
                        Manage Subscription
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-green-400">User Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium">Full Name</label>
                        <input 
                          name="fullName" 
                          type="text" 
                          placeholder="Your full name" 
                          onChange={handleChange}
                          value={accountData.fullName} 
                          className="w-full p-2 rounded text-black" 
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium">Phone Number</label>
                        <input 
                          name="phoneNumber" 
                          type="text" 
                          placeholder="Your phone number" 
                          onChange={handleChange}
                          value={accountData.phoneNumber} 
                          className="w-full p-2 rounded text-black" 
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium">Email Address</label>
                        <input 
                          type="email" 
                          value={user?.email || ""}
                          className="w-full p-2 rounded bg-gray-700 text-gray-300" 
                          disabled 
                        />
                        <p className="mt-1 text-xs text-gray-400">Email cannot be changed (linked to your account)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold mb-4 text-green-400">CRM Integration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium">Preferred CRM</label>
                        <select 
                          name="preferredCRM" 
                          onChange={handleChange} 
                          value={accountData.preferredCRM}
                          className="w-full p-2 rounded text-black"
                        >
                          <option value="None">None (Disabled)</option>
                          <option value="GoHighLevel">GoHighLevel</option>
                          <option value="Podio">Podio</option>
                          <option value="Notion">Notion</option>
                          <option value="REI Reply">REI Reply</option>
                        </select>
                      </div>
                      
                      {accountData.preferredCRM !== "None" && (
                        <>
                          <div>
                            <label className="block mb-2 text-sm font-medium">
                              {accountData.preferredCRM === "GoHighLevel" && "Webhook URL"}
                              {accountData.preferredCRM === "Podio" && "API Key"}
                              {accountData.preferredCRM === "Notion" && "Integration Token"}
                              {accountData.preferredCRM === "REI Reply" && "API Endpoint"}
                            </label>
                            <input 
                              name="crmAPIKey" 
                              type="text" 
                              placeholder={`Enter your ${accountData.preferredCRM} ${
                                accountData.preferredCRM === "GoHighLevel" ? "webhook URL" :
                                accountData.preferredCRM === "Notion" ? "integration token" :
                                "API key"
                              }`} 
                              onChange={handleChange}
                              value={accountData.crmAPIKey} 
                              className="w-full p-2 rounded text-black" 
                            />
                            <p className="mt-1 text-xs text-gray-400">
                              {accountData.preferredCRM === "GoHighLevel" && "Find this in your GoHighLevel workflow settings"}
                              {accountData.preferredCRM === "Podio" && "Generate this in your Podio developer settings"}
                              {accountData.preferredCRM === "Notion" && "Create an integration at notion.so/my-integrations"}
                              {accountData.preferredCRM === "REI Reply" && "Available in your REI Reply account settings"}
                            </p>
                          </div>
                          
                          <div className="flex items-center">
                            <input 
                              id="syncAutomatically" 
                              name="syncAutomatically" 
                              type="checkbox" 
                              onChange={handleChange}
                              checked={accountData.syncAutomatically} 
                              className="w-4 h-4 text-green-600 rounded focus:ring-0" 
                            />
                            <label htmlFor="syncAutomatically" className="ml-2 text-sm">
                              Sync new deals automatically
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {saveSuccess && (
                    <div className="p-3 bg-green-900/50 border border-green-500 rounded-md text-green-400">
                      Settings saved successfully!
                    </div>
                  )}
                  
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded font-medium"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-green-400">CRM Integration Guide</h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium text-white">GoHighLevel</h4>
                    <p className="text-gray-300">Create a webhook in GoHighLevel workflows and paste the URL here to send all your deals directly to your CRM.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white">Podio</h4>
                    <p className="text-gray-300">Generate an API key from your Podio account developer settings and paste it here along with your app ID.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white">Notion</h4>
                    <p className="text-gray-300">Create an integration at notion.so/my-integrations, then share your database with the integration and paste the token here.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white">REI Reply</h4>
                    <p className="text-gray-300">Find your API endpoint in REI Reply settings and paste it here to automate deal creation.</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-medium text-white">Need Help?</h4>
                    <p className="text-gray-300">Contact our support team for help setting up your preferred CRM integration.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Add authentication protection to this page
export async function getServerSideProps(context) {
  // Use our enhanced authentication function that checks trial/subscription status
  // This will automatically redirect to login or upgrade pages as needed
  return await requireAuthentication(context);
}