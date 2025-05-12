import { useState } from "react";
import { getSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

export default function AnalyzeDeal({ user }) {
  const [form, setForm] = useState({
    purchasePrice: "",
    marketValue: "",
    sellerMotivation: "Neutral",
    roadAccess: "Yes",
    utilities: "Yes",
    zoningNotes: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateScore = (data) => {
    const { purchasePrice, marketValue, sellerMotivation, roadAccess, utilities } = data;
    const baseScore = ((marketValue - purchasePrice) / marketValue) * 100;

    let motivationBonus = 0;
    if (sellerMotivation === "Hot") motivationBonus = 10;
    else if (sellerMotivation === "Warm") motivationBonus = 5;

    const roadPoints = roadAccess === "Yes" ? 10 : -10;
    const utilityPoints = utilities === "Yes" ? 10 : -10;

    const sniperScore = Math.round(baseScore + motivationBonus + roadPoints + utilityPoints);
    const riskLevel =
      sniperScore > 70 ? "Green" : sniperScore >= 40 ? "Yellow" : "Red";
    const exitStrategy =
      sniperScore > 70 ? "Flip" : sniperScore >= 40 ? "Hold or Wholesale" : "Pass";

    return {
      sniperScore,
      recommendedOffer: (marketValue * 0.7).toFixed(2),
      riskLevel,
      exitStrategy,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedForm = {
      ...form,
      purchasePrice: parseFloat(form.purchasePrice),
      marketValue: parseFloat(form.marketValue),
    };
    setResult(calculateScore(parsedForm));
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>Analyze Deal - RE Hustle V2</title>
        <meta name="description" content="Analyze your real estate deal with our Sniper Score system" />
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
                  <Link href="/analyze-deal" className="text-green-400 font-bold">
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
        <h2 className="text-2xl font-bold mb-6">Analyze New Land Deal</h2>
        
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg bg-gray-800 p-6 rounded-lg shadow-lg">
          <div>
            <label className="block mb-2 text-sm font-medium">Purchase Price ($)</label>
            <input 
              name="purchasePrice" 
              type="number" 
              placeholder="Enter purchase price" 
              onChange={handleChange}
              value={form.purchasePrice} 
              className="w-full p-2 rounded text-black" 
              required 
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Market Value ($)</label>
            <input 
              name="marketValue" 
              type="number" 
              placeholder="Enter market value" 
              onChange={handleChange}
              value={form.marketValue} 
              className="w-full p-2 rounded text-black" 
              required 
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Seller Motivation</label>
            <select 
              name="sellerMotivation" 
              onChange={handleChange} 
              value={form.sellerMotivation}
              className="w-full p-2 rounded text-black"
            >
              <option>Hot</option>
              <option>Warm</option>
              <option>Neutral</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Road Access</label>
            <select 
              name="roadAccess" 
              onChange={handleChange} 
              value={form.roadAccess}
              className="w-full p-2 rounded text-black"
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Utilities</label>
            <select 
              name="utilities" 
              onChange={handleChange} 
              value={form.utilities}
              className="w-full p-2 rounded text-black"
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Zoning Notes</label>
            <textarea 
              name="zoningNotes" 
              placeholder="Enter any zoning details or notes" 
              onChange={handleChange}
              value={form.zoningNotes} 
              className="w-full p-2 rounded text-black h-24" 
            />
          </div>
          
          <button 
            type="submit" 
            className="mt-2 bg-green-500 p-3 rounded text-white font-bold hover:bg-green-600 transition"
          >
            Calculate Sniper Score
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-green-400">Deal Analysis Results</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span className="font-medium">Sniper Score:</span>
                <span className={`font-bold ${
                  result.sniperScore > 70 ? 'text-green-400' : 
                  result.sniperScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>{result.sniperScore}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span className="font-medium">Recommended Offer:</span>
                <span className="font-bold">${result.recommendedOffer}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span className="font-medium">Risk Level:</span>
                <span className={`font-bold ${
                  result.riskLevel === 'Green' ? 'text-green-400' : 
                  result.riskLevel === 'Yellow' ? 'text-yellow-400' : 'text-red-400'
                }`}>{result.riskLevel}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span className="font-medium">Exit Strategy:</span>
                <span className="font-bold">{result.exitStrategy}</span>
              </div>
              
              <div className="pt-4 flex items-center justify-between">
                <Link href="/saved-deals" className="text-blue-400 hover:underline">
                  View All Saved Deals
                </Link>
                <button
                  onClick={() => alert('Deal saved successfully! This feature will be fully implemented when we connect to MongoDB.')}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-medium"
                >
                  Save Deal
                </button>
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