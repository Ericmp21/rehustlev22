import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Login attempt for:", email);
      
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: '/dashboard', // Explicitly set callback URL
      });

      console.log("Login response:", {
        ok: res?.ok,
        status: res?.status,
        hasError: !!res?.error,
        url: res?.url
      });

      if (res?.error) {
        console.error("Login error:", res.error);
        setError("Invalid login. Please try again.");
      } else {
        // Use a forced page reload to ensure the session is properly loaded
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <Head>
        <title>Login - RE Hustle V2</title>
        <meta name="description" content="Sign in to your RE Hustle account" />
      </Head>

      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-green-400">Welcome Back</h1>
        
        <form
          onSubmit={handleLogin}
          className="bg-slate-800 p-8 rounded-lg shadow-md"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-green-500 hover:bg-green-600 transition text-white font-bold py-2 px-4 rounded ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">Don't have an account?</span>{" "}
            <Link href="/register" className="text-green-400 hover:underline">
              Create account
            </Link>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            <p>For testing, use: test@example.com / password123</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}