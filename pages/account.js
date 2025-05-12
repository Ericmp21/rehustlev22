import { useState, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

export default function Account({ user }) {
  const [accountData, setAccountData] = useState({
    fullName: "",
    phoneNumber: "",
    preferredCRM: "None",
    crmAPIKey: "",
    syncAutomatically: false
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

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