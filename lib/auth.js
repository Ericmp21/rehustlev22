import bcrypt from 'bcrypt';
import clientPromise from './mongodb';

// Helper function to connect to the users collection
export async function getUsersCollection() {
  const client = await clientPromise;
  return client.db().collection('users');
}

// Helper function to hash a password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Helper function to compare a password to its hash
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Helper function to find a user by their email
export async function findUserByEmail(email) {
  const users = await getUsersCollection();
  return await users.findOne({ email: email.toLowerCase() });
}

// Helper function to create a new user
export async function createUser(userData) {
  const { email, password } = userData;
  
  const users = await getUsersCollection();
  
  // Create the user document
  const user = {
    email: email.toLowerCase(),
    password: await hashPassword(password),
    plan: 'free',
    customerId: null,
    createdAt: new Date(),
  };
  
  const result = await users.insertOne(user);
  
  return {
    id: result.insertedId.toString(),
    email: user.email,
    plan: user.plan,
    customerId: user.customerId,
    createdAt: user.createdAt,
  };
}