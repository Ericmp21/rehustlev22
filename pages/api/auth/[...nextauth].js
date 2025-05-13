import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import { getUserByEmail, verifyPassword } from "../../../lib/auth";

// Let's simplify our approach and make NextAuth more resilient
// We'll avoid complex setup that could throw errors
export default NextAuth({
  // Add adapter only if it's available in a try/catch
  ...(() => {
    try {
      return { adapter: MongoDBAdapter(clientPromise) };
    } catch (e) {
      console.warn("MongoDB adapter initialization failed, falling back to JWT only");
      return {}; // No adapter if MongoDB is unavailable
    }
  })(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { email, password } = credentials;
        
        try {
          // Fetch the user from MongoDB
          const user = await getUserByEmail(email);
          
          if (!user) {
            console.log(`No user found with email: ${email}`);
            return null;
          }
          
          // Verify the password
          const isValid = await verifyPassword(password, user.password);
          
          if (!isValid) {
            console.log('Invalid password');
            return null;
          }
          
          // Return a user object excluding the password
          return { 
            id: user._id.toString(),
            email: user.email,
            name: user.name || '',
            userId: user._id.toString(), // Add userId to be consistent
          };
        } catch (error) {
          console.error('Error in authorize:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userId = user.id; // Ensure userId is in the token
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.userId = token.id; // Add userId to session for consistency
        if (token.name) {
          session.user.name = token.name;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
    newUser: "/dashboard", // Redirect new users to dashboard
  },
  secret: process.env.NEXTAUTH_SECRET || "a-strong-secret-for-development-only",
  debug: process.env.NODE_ENV === 'development',
});