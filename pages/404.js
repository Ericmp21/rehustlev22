import Link from 'next/link';
import Head from 'next/head';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found | RE Hustle</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Head>
      
      <div className="min-h-screen flex flex-col items-center justify-center p-5 text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-6">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <a className="btn-primary">Return Home</a>
        </Link>
      </div>
    </>
  );
}