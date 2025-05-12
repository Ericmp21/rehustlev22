import { getSession } from "next-auth/react";
import { getDealById, updateDeal, deleteDeal } from "../../../lib/deals";

export default async function handler(req, res) {
  // Get deal ID from the URL
  const { id } = req.query;
  
  // Get user session
  const session = await getSession({ req });
  
  // Check authentication
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  switch (req.method) {
    case 'GET':
      try {
        // Get a specific deal
        const deal = await getDealById(id, userId);
        
        if (!deal) {
          return res.status(404).json({ message: 'Deal not found' });
        }
        
        return res.status(200).json(deal);
      } catch (error) {
        console.error('Error fetching deal:', error);
        return res.status(500).json({ message: 'Failed to fetch deal', error: error.message });
      }
      
    case 'PUT':
    case 'PATCH':
      try {
        // Update a deal
        const updateData = req.body;
        
        // Basic validation
        if (!updateData) {
          return res.status(400).json({ message: 'Invalid update data' });
        }
        
        const updatedDeal = await updateDeal(id, updateData, userId);
        
        if (!updatedDeal) {
          return res.status(404).json({ message: 'Deal not found' });
        }
        
        return res.status(200).json(updatedDeal);
      } catch (error) {
        console.error('Error updating deal:', error);
        return res.status(500).json({ message: 'Failed to update deal', error: error.message });
      }
      
    case 'DELETE':
      try {
        // Delete a deal
        const deleted = await deleteDeal(id, userId);
        
        if (!deleted) {
          return res.status(404).json({ message: 'Deal not found' });
        }
        
        return res.status(200).json({ message: 'Deal deleted successfully' });
      } catch (error) {
        console.error('Error deleting deal:', error);
        return res.status(500).json({ message: 'Failed to delete deal', error: error.message });
      }
      
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}