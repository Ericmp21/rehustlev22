import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// Removed MongoDB adapter dependency temporarily

export default NextAuth({
  // Removed MongoDB adapter temporarily
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // TEMPORARY: Mock authorization that allows any login
        // This will be replaced with actual MongoDB authentication later
        
        if (!credentials) {
          return null;
        }
        
        // For development preview, accept any credentials with minimal validation
        if (!credentials.email || !credentials.email.includes('@') || !credentials.password) {
          console.log('Invalid login attempt - basic validation failed');
          return null;
        }

        // Return a mock user for development
        return {
          id: '1',
          email: credentials.email,
          name: 'Demo User',
        };
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Include user ID in the token if available
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Include user ID in the session
      if (token) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  // Enable debug mode to help troubleshoot issues
  debug: process.env.NODE_ENV === 'development',
});