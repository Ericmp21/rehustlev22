import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

// MongoDB collection name
const COLLECTION = 'deals';

/**
 * Save a new deal to MongoDB
 * @param {Object} dealData - The deal data to save
 * @param {string} userId - The ID of the user saving the deal
 * @returns {Promise<Object>} The saved deal with its ID
 */
export async function saveDeal(dealData, userId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Add user reference and timestamp if not present
    const dealToSave = {
      ...dealData,
      userId,
      createdAt: dealData.timestamp || new Date().toISOString(),
    };
    
    const result = await db.collection(COLLECTION).insertOne(dealToSave);
    
    return {
      ...dealToSave,
      _id: result.insertedId,
    };
  } catch (error) {
    console.error('Error saving deal:', error);
    throw new Error('Failed to save deal to database');
  }
}

/**
 * Get all deals for a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of deals
 */
export async function getUserDeals(userId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const deals = await db.collection(COLLECTION)
      .find({ userId })
      .sort({ createdAt: -1 }) // Most recent first
      .toArray();
    
    return deals;
  } catch (error) {
    console.error('Error fetching user deals:', error);
    throw new Error('Failed to fetch deals from database');
  }
}

/**
 * Get a specific deal by ID
 * @param {string} dealId - The ID of the deal
 * @param {string} userId - The ID of the user (for authorization)
 * @returns {Promise<Object|null>} The deal or null if not found
 */
export async function getDealById(dealId, userId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const deal = await db.collection(COLLECTION).findOne({
      _id: new ObjectId(dealId),
      userId,
    });
    
    return deal;
  } catch (error) {
    console.error('Error fetching deal:', error);
    throw new Error('Failed to fetch deal from database');
  }
}

/**
 * Delete a deal by ID
 * @param {string} dealId - The ID of the deal to delete
 * @param {string} userId - The ID of the user (for authorization)
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteDeal(dealId, userId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection(COLLECTION).deleteOne({
      _id: new ObjectId(dealId),
      userId,
    });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting deal:', error);
    throw new Error('Failed to delete deal from database');
  }
}

/**
 * Update an existing deal
 * @param {string} dealId - The ID of the deal to update
 * @param {Object} updateData - The data to update
 * @param {string} userId - The ID of the user (for authorization)
 * @returns {Promise<Object|null>} The updated deal or null if not found
 */
export async function updateDeal(dealId, updateData, userId) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Don't allow updating userId or _id
    const { userId: _, _id: __, ...safeUpdateData } = updateData;
    
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(dealId), userId },
      { $set: safeUpdateData },
      { returnDocument: 'after' }
    );
    
    return result.value;
  } catch (error) {
    console.error('Error updating deal:', error);
    throw new Error('Failed to update deal in database');
  }
}