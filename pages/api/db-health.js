import clientPromise, { getDatabase } from '../../lib/mongodb';
import { getSession } from 'next-auth/react';

/**
 * API endpoint to check MongoDB connectivity
 * This is useful for quickly determining if MongoDB is working
 */
export default async function handler(req, res) {
  // Get user session for protected routes
  const session = await getSession({ req });
  
  if (!req.method === 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Test direct client connection
    const client = await clientPromise;
    const pingResult = await client.db().command({ ping: 1 });
    
    // Test database helper
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    return res.status(200).json({
      status: 'success',
      connected: pingResult.ok === 1,
      database: {
        name: db.databaseName,
        collections: collectionNames
      },
      message: 'MongoDB connection is healthy'
    });
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    
    return res.status(500).json({
      status: 'error',
      connected: false,
      error: error.message,
      message: 'Failed to connect to MongoDB'
    });
  }
}