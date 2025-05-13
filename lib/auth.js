import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';
import { getDatabase } from './mongodb';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Get user from MongoDB using their email
export async function getUserByEmail(email) {
  try {
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email });
    return user;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw new Error('Database error when fetching user');
  }
}

// Create a new user in MongoDB
export async function createUser(userData) {
  try {
    const db = await getDatabase();
    
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
    throw new Error('Database error when creating user');
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