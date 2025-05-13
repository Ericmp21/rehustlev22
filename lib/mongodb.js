import { MongoClient } from "mongodb";

// Database Name - change this if you want to use a different database
export const DB_NAME = 'rehustle';

// Connection URI - parse and clean the URI
const uri = process.env.MONGODB_URI;

// Try to detect if we need to adjust the URI to work around SSL issues
let parsedUri = uri;
try {
  // For Atlas connection, remove SSL parameters if needed
  if (uri && uri.includes('mongodb+srv://')) {
    // Remove SSL parameters if they exist
    parsedUri = uri.split('?')[0] + '?retryWrites=true&w=majority';
    console.log('Adjusted MongoDB URI for better compatibility');
  }
} catch (e) {
  console.error('Error parsing MongoDB URI:', e);
}

// Connection Options - minimal to avoid issues
const options = {
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000
};

// Check if MongoDB URI is configured
if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

// Global variable to cache the MongoDB connection promise
let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(parsedUri, options);
    global._mongoClientPromise = client.connect()
      .catch(err => {
        console.error("Failed to connect to MongoDB:", err);
        // Don't throw error, just return null to allow the app to continue
        return null;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(parsedUri, options);
  clientPromise = client.connect()
    .catch(err => {
      console.error("Failed to connect to MongoDB:", err);
      // Don't throw error, just return null to allow the app to continue
      return null;
    });
}

// Helper function to get the database
export async function getDatabase() {
  try {
    const client = await clientPromise;
    if (!client) {
      console.warn("MongoDB client is null, database operations will fail");
      throw new Error("MongoDB connection not available");
    }
    return client.db(DB_NAME);
  } catch (error) {
    console.error("Error getting database:", error);
    // Return a fallback object for development
    if (process.env.NODE_ENV === "development") {
      console.warn("Using in-memory fallback for database in development");
      return {
        collection: () => ({
          // Mock collection methods that return empty results and don't fail
          findOne: async () => null,
          find: () => ({ sort: () => ({ toArray: async () => [] }) }),
          insertOne: async () => ({ insertedId: "mock-id-" + Date.now() }),
          deleteOne: async () => ({ deletedCount: 1 }),
          findOneAndUpdate: async () => ({ value: null }),
        }),
        listCollections: () => ({ toArray: async () => [] }),
        command: async () => ({ ok: 0 }),
      };
    }
    throw error;
  }
}

// Export clientPromise
export default clientPromise;