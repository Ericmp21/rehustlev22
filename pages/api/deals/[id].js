import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongodb';
import Deal from '../../../models/Deal';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this endpoint' });
  }
  
  // Extract user ID from session as a string
  const userId = session.user.id;
  
  // Get deal ID from URL
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }
  
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
      return handleGet(req, res, id, userId);
    case 'PUT':
      return handlePut(req, res, id, userId);
    case 'DELETE':
      return handleDelete(req, res, id, userId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET handler - Get a specific deal
async function handleGet(req, res, dealId, userId) {
  try {
    // Query for the deal, ensuring it belongs to the user
    const deal = await Deal.findOne({ _id: dealId, userId: userId }).lean();
    
    // Check if deal exists
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    
    return res.status(200).json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return res.status(500).json({ error: 'Failed to fetch deal' });
  }
}

// PUT handler - Update a deal
async function handlePut(req, res, dealId, userId) {
  try {
    // Validate request body
    const updateData = req.body;
    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({ error: 'Invalid update data' });
    }
    
    // Update the deal and return the updated document
    const updatedDeal = await Deal.findOneAndUpdate(
      { _id: dealId, userId: userId },
      { $set: updateData },
      { new: true } // Return the updated document
    ).lean();
    
    // Check if deal was found and updated
    if (!updatedDeal) {
      return res.status(404).json({ error: 'Deal not found or not authorized' });
    }
    
    return res.status(200).json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal:', error);
    return res.status(500).json({ error: 'Failed to update deal' });
  }
}

// DELETE handler - Delete a deal
async function handleDelete(req, res, dealId, userId) {
  try {
    // Delete the deal
    const result = await Deal.deleteOne({ _id: dealId, userId: userId });
    
    // Check if deal was found and deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Deal not found or not authorized' });
    }
    
    return res.status(200).json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return res.status(500).json({ error: 'Failed to delete deal' });
  }
}