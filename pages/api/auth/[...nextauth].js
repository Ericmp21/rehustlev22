import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../lib/mongodb";
import bcryptjs, { compare } from "bcryptjs";
import { getUserByEmail, verifyPassword, createUser } from "../../../lib/auth";

// Server-side import
import User from "../../../models/User";

// Using Next.js with Mongoose for MongoDB connectivity
// This avoids the 'dns' module error that occurs with the MongoDB adapter
export const authOptions = {
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
          
          // Connect to the database
          await dbConnect();
          
          // Try to create test user if they don't exist
          if (email === 'test@example.com' && password === 'password123') {
            try {
              const existingUser = await User.findOne({ email });
              
              if (!existingUser) {
                console.log('Creating test user since it does not exist');
                
                // Create a new test user
                const hashedPassword = await bcryptjs.hash(password, 12);
                const newUser = await User.create({
                  email: 'test@example.com',
                  password: hashedPassword,
                  name: 'Test User',
                  trial_start_date: new Date(),
                  is_subscribed: false
                });
                
                console.log(`Test user created with ID: ${newUser._id}`);
                
                // Return the newly created test user
                return {
                  id: newUser._id.toString(),
                  email: newUser.email,
                  name: newUser.name,
                  userId: newUser._id.toString()
                };
              }
            } catch (e) {
              console.error('Error checking/creating test user:', e);
            }
          }
          
          // Find user in the database
          const user = await User.findOne({ email });
          
          if (!user) {
            console.log(`No user found with email: ${email}`);
            return null;
          }
          
          console.log(`User found: ${user.email}, ID: ${user._id}, verifying password`);
          
          // Special case for unencrypted test user password
          if (password === 'password123' && email === 'test@example.com' && 
              user.password === 'password123') {
            console.log('Using special case for test user password');
            
            return { 
              id: user._id.toString(),
              email: user.email,
              name: user.name || '',
              userId: user._id.toString()
            };
          }
          
          // Verify the password
          const isValid = await compare(password, user.password);
          
          if (!isValid) {
            console.log('Invalid password');
            return null;
          }
          
          console.log('Password verified successfully');
          
          // Return a user object excluding the password
          return { 
            id: user._id.toString(),
            email: user.email,
            name: user.name || '',
            userId: user._id.toString()
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
};

export default NextAuth(authOptions);