import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongodb';
import Deal from '../../../models/Deal';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this endpoint' });
  }
  
  // Extract user ID from session
  const userId = session.user.id;
  
  // Connect to the database
  try {
    await dbConnect();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, userId);
    case 'POST':
      return handlePost(req, res, userId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET handler - Get all deals for a user
async function handleGet(req, res, userId) {
  try {
    // Use string userId directly without any casting
    // Query all deals for the user
    const deals = await Deal.find({ userId: userId })
      .sort({ createdAt: -1 }) // Latest first
      .lean(); // Convert to plain JavaScript objects
    
    return res.status(200).json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return res.status(500).json({ error: 'Failed to fetch deals' });
  }
}

// POST handler - Create a new deal
async function handlePost(req, res, userId) {
  try {
    // Validate request body
    const dealData = req.body;
    if (!dealData || typeof dealData !== 'object') {
      return res.status(400).json({ error: 'Invalid deal data' });
    }
    
    // Use string userId directly without any casting
    // Create a new deal
    const deal = new Deal({
      ...dealData,
      userId: userId
    });
    
    // Save the deal
    const savedDeal = await deal.save();
    
    // Return the saved deal
    return res.status(201).json(savedDeal);
  } catch (error) {
    console.error('Error creating deal:', error);
    return res.status(500).json({ error: 'Failed to create deal' });
  }
}