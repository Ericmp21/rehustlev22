import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';
import { getDatabase } from './mongodb';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Get user from MongoDB using their email
export async function getUserByEmail(email) {
  try {
    if (!email) {
      console.error('getUserByEmail called with empty email');
      return null;
    }
    
    console.log(`Looking up user with email: ${email}`);
    
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email });
    
    if (user) {
      console.log(`Found user with email ${email}, ID: ${user._id}`);
    } else {
      console.log(`No user found with email: ${email}`);
    }
    
    return user;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw new Error(`Database error when fetching user: ${error.message}`);
  }
}

// Create a new user in MongoDB
export async function createUser(userData) {
  try {
    const db = await getDatabase();
    
    const { email, password, name, trial_start_date, is_subscribed } = userData;
    
    console.log(`Hashing password for new user: ${email}`);
    const hashedPassword = await hashPassword(password);
    
    // Format trial start date properly
    const trialStartDate = trial_start_date ? new Date(trial_start_date) : new Date();
    
    // Create a full user record
    const userDoc = {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0], // Use email prefix as name if not provided
      trial_start_date: trialStartDate,
      is_subscribed: is_subscribed || false,
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    
    console.log(`Inserting new user into database: ${email}`);
    const result = await db.collection('users').insertOne(userDoc);
    
    console.log(`User inserted successfully, ID: ${result.insertedId}`);
    
    // Return user object with ID for session creation
    return { 
      id: result.insertedId.toString(), // Convert ObjectId to string
      _id: result.insertedId, // Include raw _id for compatibility
      email, 
      name: userDoc.name, 
      trial_start_date: trialStartDate,
      is_subscribed: userDoc.is_subscribed
    };
  } catch (error) {
    console.error('Error in createUser:', error);
    throw new Error(`Database error when creating user: ${error.message}`);
  }
}

// Check if a user is authenticated for API routes
export async function isAuthenticated(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    res.status(401).json({ error: 'Not authenticated' });
    return false;
  }
  
  return session;
}

// Check if trial is active for a user
export async function isTrialActive(userId) {
  try {
    const db = await getDatabase();
    
    // Get the user with the given id
    const user = await db.collection('users').findOne({ _id: userId });
    
    if (!user) {
      return false;
    }
    
    // If user is subscribed, trial status doesn't matter
    if (user.is_subscribed) {
      return true;
    }
    
    // Check if the trial has expired (7 days from start)
    const trialStartDate = user.trial_start_date ? new Date(user.trial_start_date) : null;
    
    if (!trialStartDate) {
      return false; // No trial start date found
    }
    
    // Calculate trial end date (7 days after start)
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    // Check if current date is before trial end date
    const currentDate = new Date();
    return currentDate < trialEndDate;
  } catch (error) {
    console.error('Error checking trial status:', error);
    return false; // Default to trial expired on error
  }
}

// Get trial status information for a user
export async function getTrialStatus(userId) {
  try {
    const db = await getDatabase();
    
    // Get the user with the given id
    const user = await db.collection('users').findOne({ _id: userId });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // If user is already subscribed
    if (user.is_subscribed) {
      return {
        isActive: true,
        isSubscribed: true,
        trialStartDate: user.trial_start_date,
        trialEndDate: null,
        daysRemaining: 0,
        message: 'Subscribed account'
      };
    }
    
    // Calculate trial information
    const trialStartDate = user.trial_start_date ? new Date(user.trial_start_date) : new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    const currentDate = new Date();
    const isActive = currentDate < trialEndDate;
    
    // Calculate days remaining
    const diffTime = trialEndDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, diffDays);
    
    // Return trial status
    return {
      isActive,
      isSubscribed: false,
      trialStartDate,
      trialEndDate,
      daysRemaining,
      message: isActive 
        ? `Trial active - ${daysRemaining} days remaining` 
        : 'Trial has expired'
    };
  } catch (error) {
    console.error('Error getting trial status:', error);
    throw error;
  }
}

// Update subscription status
export async function updateSubscriptionStatus(userId, isSubscribed) {
  try {
    const db = await getDatabase();
    
    // Update the user with subscription status
    const result = await db.collection('users').updateOne(
      { _id: userId },
      { $set: { is_subscribed: isSubscribed } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

// Check if a user is authenticated, has active trial/subscription and redirect if needed
export async function requireAuthentication(context) {
  const session = await getSession(context);
  
  // If no user is logged in, redirect to login
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  try {
    // Get full user data including trial/subscription info
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email: session.user.email });
    
    // If user not found in database but has session
    if (!user) {
      // Clear session and redirect to login
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    
    // Check if subscribed or trial is active
    const isSubscribed = user.is_subscribed;
    
    if (isSubscribed) {
      // User is subscribed, allow access
      return { 
        props: { 
          user: {
            ...session.user,
            isSubscribed: true,
            trialActive: true
          } 
        } 
      };
    }
    
    // Check trial status
    const trialStartDate = user.trial_start_date ? new Date(user.trial_start_date) : null;
    
    if (!trialStartDate) {
      // No trial start date, redirect to upgrade
      return {
        redirect: {
          destination: '/upgrade',
          permanent: false,
        },
      };
    }
    
    // Calculate trial end date and compare with current date
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    const currentDate = new Date();
    const trialActive = currentDate < trialEndDate;
    
    if (!trialActive) {
      // Trial has expired, redirect to upgrade page
      return {
        redirect: {
          destination: '/upgrade',
          permanent: false,
        },
      };
    }
    
    // Calculate days remaining in trial
    const diffTime = trialEndDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, diffDays);
    
    // Trial is active, allow access with trial info
    return { 
      props: { 
        user: {
          ...session.user,
          isSubscribed: false,
          trialActive: true,
          trialEndDate: trialEndDate.toISOString(),
          daysRemaining
        } 
      } 
    };
  } catch (error) {
    console.error('Error in requireAuthentication:', error);
    
    // On error, default to allowing access with warning
    // This prevents locked-out users in case of database errors
    return { 
      props: { 
        user: {
          ...session.user,
          isSubscribed: false,
          trialActive: true,
          trialStatus: 'unknown',
          error: 'Could not verify subscription status'
        } 
      } 
    };
  }
}