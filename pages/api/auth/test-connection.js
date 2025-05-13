/**
 * Test endpoint to check if MongoDB connection is working properly
 */
import { getDatabase } from '../../../lib/mongodb';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  // This endpoint can be accessed without authentication
  const session = await getSession({ req });
  const isAuthenticated = !!session;
  
  try {
    // Test MongoDB connectivity
    const db = await getDatabase();
    
    // Try to do a simple operation
    const dbTest = await db.command({ ping: 1 }).catch(err => ({ ok: 0, error: err.message }));
    
    // Check collections
    const collections = await db.listCollections().toArray().catch(() => []);
    
    // Return success information
    return res.status(200).json({
      status: 'success',
      mongodb: {
        connected: dbTest.ok === 1,
        collections: collections.map(c => c.name),
      },
      auth: {
        session: isAuthenticated ? { 
          userId: session.user.id, 
          email: session.user.email,
        } : null,
        isAuthenticated,
      },
      env: {
        mongodb_configured: !!process.env.MONGODB_URI,
        nextauth_configured: !!process.env.NEXTAUTH_SECRET,
        node_env: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('API test error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}