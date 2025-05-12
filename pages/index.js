import { getSession } from 'next-auth/react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>RE Hustle V2 - Real Estate Deal Analysis</title>
        <meta name="description" content="Analyze real estate deals with our powerful calculator and scoring system" />
      </Head>

      <h1 className="text-4xl font-bold text-green-400 mb-8">Redirecting...</h1>
      <p className="text-gray-300">Please wait, redirecting you to the appropriate page.</p>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  } else {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}