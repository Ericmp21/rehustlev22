import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/mongodb';
import Deal from '../../../models/Deal';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this endpoint' });
  }

  const userId = session.user.id;

  try {
    await dbConnect();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, userId);
    case 'POST':
      return handlePost(req, res, userId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res, userId) {
  try {
    const deals = await Deal.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return res.status(500).json({ error: 'Failed to fetch deals' });
  }
}

async function handlePost(req, res, userId) {
  try {
    const dealData = req.body;
    if (!dealData || typeof dealData !== 'object') {
      return res.status(400).json({ error: 'Invalid deal data' });
    }

    const deal = new Deal({
      ...dealData,
      userId,
    });

    const savedDeal = await deal.save();
    return res.status(201).json(savedDeal);
  } catch (error) {
    console.error('Error creating deal:', error);
    return res.status(500).json({ error: 'Failed to create deal' });
  }
}
