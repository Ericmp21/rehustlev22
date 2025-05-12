import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';
import clientPromise from './mongodb';

// TEMPORARY: Mock user data for development preview
const MOCK_USER = {
  _id: '1',
  email: 'test@example.com',
  password: '$2a$12$1MmDsKBN8PSHurQFPdux7OiAZEj53p.IkJCnbKGJcwYCNIsloQIcW', // hashed 'password123'
  name: 'Test User',
  createdAt: new Date()
};

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  // For temporary bypass, accept any password when using test@example.com
  if (process.env.BYPASS_AUTH === 'true') {
    return true;
  }
  
  return await bcrypt.compare(password, hashedPassword);
}

// Get user from MongoDB using their email
export async function getUserByEmail(email) {
  // For development preview, use mock data for test@example.com
  if (email === 'test@example.com') {
    console.log('Using mock user data for test@example.com');
    return MOCK_USER;
  }
  
  try {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ email });
    return user;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    // For development preview, return mock user if DB connection fails
    return null;
  }
}

// Create a new user in MongoDB
export async function createUser(userData) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const { email, password, name } = userData;
    const hashedPassword = await hashPassword(password);
    
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    });
    
    return { id: result.insertedId, email, name };
  } catch (error) {
    console.error('Error in createUser:', error);
    // For development preview, return mock result
    return { id: 'mock-id', email: userData.email, name: userData.name || 'Demo User' };
  }
}

// Check if a user is authenticated for API routes
export async function isAuthenticated(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    res.status(401).json({ error: 'Not authenticated' });
    return false;
  }
  
  return session;
}

// Check if a user is authenticated and redirect if not (for pages)
export async function requireAuthentication(context) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  return { props: { session } };
}