import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import { getUserByEmail, verifyPassword } from "../../../lib/auth";

// Do a test connection to MongoDB
let mongoDbConnected = false;
(async () => {
  try {
    const client = await clientPromise;
    const result = await client.db().command({ ping: 1 });
    if (result.ok === 1) {
      console.log("MongoDB connection successful");
      mongoDbConnected = true;
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
})();

export default NextAuth({
  ...(mongoDbConnected ? { adapter: MongoDBAdapter(clientPromise) } : {}),
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
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
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
  },
  secret: process.env.NEXTAUTH_SECRET || "a-strong-secret-for-development-only",
  debug: process.env.NODE_ENV === 'development',
});