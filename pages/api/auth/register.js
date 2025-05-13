import { createUser, getUserByEmail } from '../../../lib/auth';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { email, password, name, trial_start_date, is_subscribed } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Create the new user with trial information
    const user = await createUser({ 
      email, 
      password, 
      name,
      trial_start_date: trial_start_date || new Date().toISOString(), // Ensure trial start date is set
      is_subscribed: is_subscribed || false // Default to not subscribed
    });
    
    // Return success response but hide sensitive information
    return res.status(201).json({ 
      message: 'User created', 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        trial_start_date: user.trial_start_date,
        is_subscribed: user.is_subscribed
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
}