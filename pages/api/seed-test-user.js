import { createUser, getUserByEmail } from '../../lib/auth';

export default async function handler(req, res) {
  // Restrict to development environment only
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Forbidden in production' });
  }

  try {
    // Check if test user already exists
    const existingUser = await getUserByEmail('test@example.com');
    
    if (existingUser) {
      return res.status(200).json({ 
        message: 'Test user already exists',
        email: 'test@example.com',
        password: 'password123'
      });
    }
    
    // Create test user
    const user = await createUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      trial_start_date: new Date().toISOString(),
      is_subscribed: false
    });
    
    return res.status(201).json({
      message: 'Test user created',
      email: 'test@example.com',
      password: 'password123',
      userId: user.id
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return res.status(500).json({ message: 'Failed to create test user', error: error.message });
  }
}