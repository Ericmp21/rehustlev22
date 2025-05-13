import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import { getUserByEmail, verifyPassword, createUser } from "../../../lib/auth";

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
          console.error('No credentials provided');
          return null;
        }

        const { email, password } = credentials;
        
        if (!email || !password) {
          console.error('Missing email or password');
          return null;
        }
        
        try {
          console.log(`Attempting to authorize: ${email}`);
          
          // Try to create test user if they don't exist
          if (email === 'test@example.com' && password === 'password123') {
            try {
              const existingUser = await getUserByEmail(email);
              
              if (!existingUser) {
                console.log('Creating test user since it does not exist');
                const testUser = await createUser({
                  email: 'test@example.com',
                  password: 'password123', 
                  name: 'Test User',
                  trial_start_date: new Date().toISOString(),
                  is_subscribed: false
                });
                
                console.log(`Test user created with ID: ${testUser.id}`);
                
                // Return the newly created test user
                return {
                  id: testUser.id,
                  email: testUser.email,
                  name: testUser.name,
                  userId: testUser.id
                };
              }
            } catch (e) {
              console.error('Error checking/creating test user:', e);
            }
          }
          
          // Fetch the user from MongoDB/fallback storage
          const user = await getUserByEmail(email);
          
          if (!user) {
            console.log(`No user found with email: ${email}`);
            return null;
          }
          
          console.log(`User found: ${user.email}, ID: ${user._id}, verifying password`);
          
          // Verify the password
          const isValid = await verifyPassword(password, user.password);
          
          if (!isValid) {
            console.log('Invalid password');
            return null;
          }
          
          console.log('Password verified successfully');
          
          // Convert ID to string if it's an object
          const userId = typeof user._id === 'object' ? user._id.toString() : user._id;
          
          // Return a user object excluding the password
          return { 
            id: userId,
            email: user.email,
            name: user.name || '',
            userId: userId
          };
        } catch (error) {
          console.error('Error in authorize:', error);
          // Don't throw, return null instead to show the error on the login form
          return null;
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