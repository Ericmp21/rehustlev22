import { getSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

export default function SavedDeals({ user, deals }) {
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
        
        {deals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-700 bg-gray-800 rounded">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3 text-left">Score</th>
                  <th className="p-3 text-left">Recommended Offer</th>
                  <th className="p-3 text-left">Risk</th>
                  <th className="p-3 text-left">Exit Strategy</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal, i) => (
                  <tr key={i} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="p-3">
                      <span className={`font-bold ${
                        deal.sniperScore > 70 ? 'text-green-400' : 
                        deal.sniperScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>{deal.sniperScore}</span>
                    </td>
                    <td className="p-3">${deal.recommendedOffer}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        deal.riskLevel === 'Green' ? 'bg-green-900 text-green-300' : 
                        deal.riskLevel === 'Yellow' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                      }`}>{deal.riskLevel}</span>
                    </td>
                    <td className="p-3">{deal.exitStrategy}</td>
                    <td className="p-3">
                      <button className="text-blue-400 hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  // Replace with DB fetch later
  const deals = [
    {
      sniperScore: 85,
      recommendedOffer: "56000",
      riskLevel: "Green",
      exitStrategy: "Flip",
    },
    {
      sniperScore: 42,
      recommendedOffer: "39000",
      riskLevel: "Yellow",
      exitStrategy: "Wholesale",
    },
  ];

  return {
    props: { 
      user: session.user,
      deals 
    },
  };
}