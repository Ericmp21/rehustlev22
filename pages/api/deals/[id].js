import { getSession } from 'next-auth/react';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this endpoint' });
  }
  
  // Extract user ID from session
  const userId = session.user.id;
  
  // Get deal ID from URL
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }
  
  // Get database connection
  let db;
  try {
    db = await getDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  // Create MongoDB ObjectId safely
  let dealId;
  try {
    // Check if ID is already in ObjectId format (from MongoDB)
    if (ObjectId.isValid(id)) {
      dealId = new ObjectId(id);
    } else {
      // For localStorage fallback IDs, use the string directly
      dealId = id;
    }
  } catch (error) {
    console.error('Invalid deal ID format:', error);
    return res.status(400).json({ error: 'Invalid deal ID format' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, db, dealId, userId);
    case 'PUT':
      return handlePut(req, res, db, dealId, userId);
    case 'DELETE':
      return handleDelete(req, res, db, dealId, userId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET handler - Get a specific deal
async function handleGet(req, res, db, dealId, userId) {
  try {
    // Query for the deal, ensuring it belongs to the user
    let query = {};
    
    // Construct the query based on ID type
    if (typeof dealId === 'string') {
      query = { _id: dealId, userId };
    } else {
      query = { _id: dealId, userId };
    }
    
    const deal = await db.collection('deals').findOne(query);
    
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
async function handlePut(req, res, db, dealId, userId) {
  try {
    // Validate request body
    const updateData = req.body;
    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({ error: 'Invalid update data' });
    }
    
    // Construct query based on ID type
    let query = {};
    if (typeof dealId === 'string') {
      query = { _id: dealId, userId };
    } else {
      query = { _id: dealId, userId };
    }
    
    // Update the deal
    const result = await db.collection('deals').findOneAndUpdate(
      query,
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        } 
      },
      { 
        returnDocument: 'after'
      }
    );
    
    // Check if deal was found and updated
    if (!result.value) {
      return res.status(404).json({ error: 'Deal not found or not authorized' });
    }
    
    return res.status(200).json(result.value);
  } catch (error) {
    console.error('Error updating deal:', error);
    return res.status(500).json({ error: 'Failed to update deal' });
  }
}

// DELETE handler - Delete a deal
async function handleDelete(req, res, db, dealId, userId) {
  try {
    // Construct query based on ID type
    let query = {};
    if (typeof dealId === 'string') {
      query = { _id: dealId, userId };
    } else {
      query = { _id: dealId, userId };
    }
    
    // Delete the deal
    const result = await db.collection('deals').deleteOne(query);
    
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