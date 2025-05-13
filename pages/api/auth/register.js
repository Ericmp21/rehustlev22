import { createUser, getUserByEmail } from '../../../lib/auth';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  console.log("Register API called");
  
  try {
    const { email, password, name, trial_start_date, is_subscribed } = req.body;
    
    // Enhanced validation with better error messages
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    console.log(`Checking if user with email ${email} exists`);
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Create the new user with trial information
    console.log(`Creating new user with email ${email}`);
    const user = await createUser({ 
      email, 
      password, 
      name,
      trial_start_date: trial_start_date || new Date().toISOString(), // Ensure trial start date is set
      is_subscribed: is_subscribed || false // Default to not subscribed
    });
    
    console.log(`User created successfully with ID: ${user.id}`);
    
    // Return success response but hide sensitive information
    return res.status(201).json({ 
      message: 'User created successfully', 
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
    return res.status(500).json({ 
      message: 'Failed to create account', 
      error: error.message || 'Unknown error'
    });
  }
}