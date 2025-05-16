// pages/api/account/settings.js
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      preferredCRM: user.preferredCRM || 'None',
      crmAPIKey: user.crmAPIKey || '',
      syncAutomatically: user.syncAutomatically || false,
    });
  }

  if (req.method === 'POST') {
    const { fullName, phoneNumber, preferredCRM, crmAPIKey, syncAutomatically } = req.body;

    user.fullName = fullName || '';
    user.phoneNumber = phoneNumber || '';
    user.preferredCRM = preferredCRM || 'None';
    user.crmAPIKey = crmAPIKey || '';
    user.syncAutomatically = !!syncAutomatically;

    await user.save();

    return res.status(200).json({ message: 'Settings updated successfully' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
