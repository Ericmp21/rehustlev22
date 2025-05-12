import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb';
import { findUserByEmail, comparePassword } from '../../../lib/auth';

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Check if credentials exist
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // Find the user by email
        const user = await findUserByEmail(credentials.email);
        
        // If no user is found, return null
        if (!user) {
          throw new Error('No user found with this email');
        }
        
        // Check if the password is correct
        const isValid = await comparePassword(credentials.password, user.password);
        
        // If the password is incorrect, return null
        if (!isValid) {
          throw new Error('Invalid password');
        }
        
        // Return the user data (don't include the password)
        return {
          id: user._id.toString(),
          email: user.email,
          plan: user.plan,
          customerId: user.customerId,
        };
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add user info to the token
        token.id = user.id;
        token.email = user.email;
        token.plan = user.plan;
        token.customerId = user.customerId;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to the session
      session.user.id = token.id;
      session.user.plan = token.plan;
      session.user.customerId = token.customerId;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});