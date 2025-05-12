import { getSession } from "next-auth/react";
import { saveDeal, getUserDeals } from "../../../lib/deals";

export default async function handler(req, res) {
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
        // Get all deals for the authenticated user
        const deals = await getUserDeals(userId);
        return res.status(200).json(deals);
      } catch (error) {
        console.error('Error fetching deals:', error);
        return res.status(500).json({ message: 'Failed to fetch deals', error: error.message });
      }
      
    case 'POST':
      try {
        // Save a new deal
        const dealData = req.body;
        
        // Basic validation
        if (!dealData || !dealData.propertyType) {
          return res.status(400).json({ message: 'Invalid deal data' });
        }
        
        const savedDeal = await saveDeal(dealData, userId);
        return res.status(201).json(savedDeal);
      } catch (error) {
        console.error('Error saving deal:', error);
        return res.status(500).json({ message: 'Failed to save deal', error: error.message });
      }
      
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}