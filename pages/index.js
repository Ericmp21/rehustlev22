import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  // Feature list for the marketing page
  const features = [
    {
      title: 'Smart Deal Scoring',
      description: 'Our proprietary Sniper Score algorithm analyzes 25+ factors to determine the best investment opportunities.',
      icon: '📊'
    },
    {
      title: 'Multi-Property Analysis',
      description: 'Analyze residential, multi-family, commercial, and land investments - all with specialized metrics.',
      icon: '🏘️'
    },
    {
      title: 'Automatic Comps',
      description: 'Get accurate ARV and valuation data for more confident decision-making.',
      icon: '🔍'
    },
    {
      title: 'CRM Integration',
      description: 'Sync deals with your favorite CRM platforms like Podio, GoHighLevel, Notion and REI Reply.',
      icon: '🔄'
    },
    {
      title: 'Deal Management',
      description: 'Save, track, and update your deals in one centralized dashboard.',
      icon: '📁'
    },
    {
      title: 'Mobile Friendly',
      description: 'Analyze deals on the go from any device - perfect for site visits.',
      icon: '📱'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "RE Hustle has saved me hours on each property evaluation. The Sniper Score helped me find a duplex that's now cash flowing $850/month.",
      author: "Michael S., Real Estate Investor",
      location: "Phoenix, AZ"
    },
    {
      quote: "I was overpaying for deals before using this tool. Now I can quickly analyze 10+ properties in the time it used to take to analyze one.",
      author: "Jennifer R., Property Flipper",
      location: "Miami, FL"
    }
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Head>
        <title>RE Hustle V2 - The Smartest Real Estate Deal Analyzer</title>
        <meta name="description" content="Find profitable real estate deals faster with our advanced Sniper Score system. Start your free 7-day trial today!" />
      </Head>

      {/* Navigation Bar */}
      <nav className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-green-400">RE Hustle V2</div>
          <div className="flex space-x-4">
            <Link href="/login">
              <span className="text-gray-300 hover:text-white cursor-pointer">Login</span>
            </Link>
            <Link href="/register">
              <span className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-white font-medium cursor-pointer">
                Start Free Trial
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-20 px-4 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-4 leading-tight">
              The Smartest Real Estate Deal Analyzer
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Find profitable deals in seconds with our proprietary Sniper Score system.
              Analyze any property type with confidence.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <span className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-4 rounded-lg font-medium inline-block text-center">
                  Start Free 7-Day Trial
                </span>
              </Link>
              <Link href="/login">
                <span className="bg-gray-700 hover:bg-gray-600 text-white text-lg px-8 py-4 rounded-lg font-medium inline-block text-center">
                  Sign In
                </span>
              </Link>
            </div>
            <p className="mt-4 text-gray-400 text-sm">No credit card required to start your trial</p>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="bg-gray-800 p-1 rounded-lg shadow-xl">
              {/* Placeholder for dashboard screenshot */}
              <div className="bg-gray-700 rounded h-72 sm:h-96 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-300">
                    Interactive real estate analysis dashboard with property valuation, cash flow projections, and investment metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features For Real Estate Investors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-8 shadow-lg">
                <div className="text-green-400 text-4xl mb-4">"</div>
                <p className="text-lg mb-6 italic">{testimonial.quote}</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-gray-400">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="bg-gray-700 rounded-lg shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-600">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Professional Plan</h3>
                  <p className="text-gray-300 mt-2">Everything you need to find and analyze deals</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">$47<span className="text-lg font-normal text-gray-400">/month</span></div>
                  <p className="text-gray-400">Billed monthly</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h4 className="font-bold mb-4">Includes:</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Unlimited deal analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>All property types supported (residential, multi-family, commercial, land)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Advanced Sniper Score algorithm</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>CRM integration (Podio, GoHighLevel, Notion, REI Reply)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Deal tracking and management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Mobile-friendly interface</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/register">
                  <span className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-4 rounded-lg font-medium w-full inline-block text-center">
                    Start Your 7-Day Free Trial
                  </span>
                </Link>
                <p className="text-center mt-4 text-gray-400">Cancel anytime. No hidden fees.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-500 to-green-700 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Next Profitable Deal?</h2>
          <p className="text-xl mb-8">Start your free 7-day trial and see how RE Hustle V2 can transform your investment strategy.</p>
          <Link href="/register">
            <span className="bg-white text-green-700 hover:bg-gray-100 text-lg px-8 py-4 rounded-lg font-medium inline-block">
              Get Started Today
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="text-2xl font-bold text-green-400 mb-2">RE Hustle V2</div>
              <p>The smartest real estate deal analyzer for investors</p>
            </div>
            <div className="flex space-x-8">
              <div>
                <h3 className="font-bold text-white mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="/register"><span className="hover:text-white cursor-pointer">Free Trial</span></Link></li>
                  <li><Link href="/login"><span className="hover:text-white cursor-pointer">Login</span></Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-3">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white">About Us</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800 text-center">
            <p>&copy; {new Date().getFullYear()} RE Hustle V2. All rights reserved.</p>
          </div>
        </div>
      </footer>
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
  }
  
  return {
    props: {},
  };
}