import { getSession } from 'next-auth/react';
import { getDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this endpoint' });
  }
  
  // Extract user ID from session
  const userId = session.user.id;
  
  // Get database connection
  let db;
  try {
    db = await getDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, db, userId);
    case 'POST':
      return handlePost(req, res, db, userId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET handler - Get all deals for a user
async function handleGet(req, res, db, userId) {
  try {
    // Query all deals for the user
    const deals = await db.collection('deals')
      .find({ userId })
      .sort({ createdAt: -1 }) // Latest first
      .toArray();
    
    return res.status(200).json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return res.status(500).json({ error: 'Failed to fetch deals' });
  }
}

// POST handler - Create a new deal
async function handlePost(req, res, db, userId) {
  try {
    // Validate request body
    const dealData = req.body;
    if (!dealData || typeof dealData !== 'object') {
      return res.status(400).json({ error: 'Invalid deal data' });
    }
    
    // Add metadata
    const deal = {
      ...dealData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the deal
    const result = await db.collection('deals').insertOne(deal);
    
    // Return the inserted deal with its ID
    return res.status(201).json({
      ...deal,
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Error creating deal:', error);
    return res.status(500).json({ error: 'Failed to create deal' });
  }
}