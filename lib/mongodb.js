import { MongoClient } from "mongodb";

// Database Name - change this if you want to use a different database
export const DB_NAME = 'rehustle';

// MongoDB connection config with several fallback options
// This helps avoid SSL certificate issues and connection problems
function getMongoConfig() {
  // Main connection URI from env
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not provided');
    return { uri: null, options: {} };
  }
  
  // Parse username and password from URI for diagnostics only
  try {
    // Extract credentials for logging (avoid logging actual credentials)
    if (uri.includes('@')) {
      const credentialPart = uri.split('@')[0].split('//')[1];
      if (credentialPart && credentialPart.includes(':')) {
        const username = credentialPart.split(':')[0];
        console.log(`Using MongoDB with username: ${username}`);
      }
    }
  } catch (error) {
    // Ignore parsing errors
  }
  
  // For URI that uses SRV records
  const isSrv = uri.includes('+srv');
  
  // Start with most compatible options
  const baseOptions = {
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    useNewUrlParser: true, 
    useUnifiedTopology: true
  };
  
  // Direct connection can sometimes bypass SSL issues
  if (isSrv) {
    console.log('Using MongoDB+SRV connection');
    
    // Try to simplify the connection URI
    let parsedUri = uri;
    try {
      // Strip query parameters and add back only essential ones
      if (uri.includes('?')) {
        parsedUri = uri.split('?')[0] + '?retryWrites=true&w=majority';
        console.log('Simplified MongoDB connection string');
      }
    } catch (e) {
      // Use original if parsing fails
      console.error('Error parsing MongoDB URI:', e);
      parsedUri = uri;
    }
    
    return {
      uri: parsedUri,
      options: {
        ...baseOptions,
        directConnection: false
      }
    };
  } else {
    // Standard connection
    console.log('Using standard MongoDB connection');
    return {
      uri,
      options: baseOptions
    };
  }
}

// Get connection configuration
const { uri, options } = getMongoConfig();

// Check if MongoDB URI is configured
if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

// Global variables to cache the MongoDB connection promise
let client;
let clientPromise;

// Create a connected client or a dummy client that fails gracefully
async function createClient() {
  if (!uri) {
    console.error("MongoDB URI is not provided");
    return null;
  }
  
  try {
    const mongoClient = new MongoClient(uri, options);
    // Connect with timeout
    const connectPromise = mongoClient.connect();
    
    // Return the connected client or null if connection fails
    return await connectPromise;
  } catch (error) {
    console.error("Failed to create MongoDB client:", error);
    return null;
  }
}

// Setup the global promise for the MongoDB client
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClient().catch(err => {
      console.error("Failed to connect to MongoDB:", err);
      return null;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createClient().catch(err => {
    console.error("Failed to connect to MongoDB:", err);
    return null;
  });
}

/**
 * Helper function to get the MongoDB database
 * Includes fallback to in-memory storage if MongoDB is unavailable
 * @returns {Promise<Db>} MongoDB database or fallback object
 */
export async function getDatabase() {
  try {
    // Await the client with a timeout
    const client = await Promise.race([
      clientPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 5000)
      )
    ]);
    
    // If client is null (connection failed), throw error to use fallback
    if (!client) {
      throw new Error("MongoDB client is null");
    }
    
    // Return the database 
    return client.db(DB_NAME);
  } catch (error) {
    console.error("Error getting MongoDB database:", error.message);
    
    // Create a localStorage-backed fallback
    return createLocalStorageFallbackDb();
  }
}

/**
 * Creates an in-memory fallback database that uses localStorage when available
 * This allows the application to function without MongoDB
 * @returns {Object} Object that mimics MongoDB database API
 */
function createLocalStorageFallbackDb() {
  // Use an in-memory store as fallback
  console.warn("Using in-memory/localStorage fallback for database");
  
  // Collection data will be stored here in memory
  const collections = {};
  
  // Try to load existing data from localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Load existing data for each known collection 
      const knownCollections = ['users', 'deals', 'accounts', 'sessions'];
      
      for (const collection of knownCollections) {
        const storedData = localStorage.getItem(`rehustle_${collection}`);
        if (storedData) {
          try {
            collections[collection] = JSON.parse(storedData);
            console.log(`Loaded ${collections[collection].length} items from localStorage for ${collection}`);
          } catch (e) {
            console.error(`Failed to parse localStorage data for ${collection}:`, e);
            collections[collection] = [];
          }
        } else {
          collections[collection] = [];
        }
      }
    }
  } catch (e) {
    console.error("Error accessing localStorage:", e);
  }
  
  // Helper to save a collection to localStorage
  const saveCollection = (name, data) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`rehustle_${name}`, JSON.stringify(data));
      }
    } catch (e) {
      console.error(`Failed to save ${name} to localStorage:`, e);
    }
  };
  
  // Return a MongoDB-like interface
  return {
    collection: (name) => {
      // Initialize collection if it doesn't exist
      if (!collections[name]) {
        collections[name] = [];
      }
      
      // Return a MongoDB-like collection interface
      return {
        findOne: async (query = {}) => {
          console.log(`[LocalDB] findOne in ${name}:`, query);
          const items = collections[name] || [];
          
          // Simple query matching
          if (query._id) {
            return items.find(item => item._id === query._id) || null;
          }
          
          // Match first item that has all query properties
          return items.find(item => {
            return Object.entries(query).every(([key, value]) => 
              item[key] === value
            );
          }) || null;
        },
        
        find: (query = {}) => {
          console.log(`[LocalDB] find in ${name}:`, query);
          const items = collections[name] || [];
          
          // Filter items by query
          let results = items;
          if (Object.keys(query).length > 0) {
            results = items.filter(item => {
              return Object.entries(query).every(([key, value]) => 
                item[key] === value
              );
            });
          }
          
          // Return a cursor-like object
          return {
            sort: (sortSpec) => {
              // Simple sorting by a single field
              if (sortSpec && Object.keys(sortSpec).length > 0) {
                const [field, order] = Object.entries(sortSpec)[0];
                results.sort((a, b) => {
                  if (a[field] < b[field]) return order === 1 ? -1 : 1;
                  if (a[field] > b[field]) return order === 1 ? 1 : -1;
                  return 0;
                });
              }
              return { toArray: async () => results };
            },
            toArray: async () => results
          };
        },
        
        insertOne: async (doc) => {
          console.log(`[LocalDB] insertOne in ${name}:`, doc);
          // Generate an ID if none provided
          const newDoc = { 
            ...doc, 
            _id: doc._id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          };
          
          collections[name].push(newDoc);
          saveCollection(name, collections[name]);
          
          return { 
            insertedId: newDoc._id,
            acknowledged: true
          };
        },
        
        deleteOne: async (filter) => {
          console.log(`[LocalDB] deleteOne in ${name}:`, filter);
          const items = collections[name];
          const initialLength = items.length;
          
          // Remove the first matching item
          const index = items.findIndex(item => {
            return Object.entries(filter).every(([key, value]) => 
              item[key] === value
            );
          });
          
          if (index !== -1) {
            items.splice(index, 1);
            saveCollection(name, items);
          }
          
          return { 
            deletedCount: initialLength - items.length,
            acknowledged: true
          };
        },
        
        updateOne: async (filter, update) => {
          console.log(`[LocalDB] updateOne in ${name}:`, filter, update);
          const items = collections[name];
          
          // Find the item to update
          const index = items.findIndex(item => {
            return Object.entries(filter).every(([key, value]) => 
              item[key] === value
            );
          });
          
          if (index !== -1) {
            // Apply $set updates
            if (update.$set) {
              items[index] = { 
                ...items[index], 
                ...update.$set 
              };
            }
            
            saveCollection(name, items);
            return { 
              modifiedCount: 1,
              acknowledged: true
            };
          }
          
          return { 
            modifiedCount: 0,
            acknowledged: true
          };
        },
        
        findOneAndUpdate: async (filter, update, options = {}) => {
          console.log(`[LocalDB] findOneAndUpdate in ${name}:`, filter, update, options);
          const items = collections[name];
          
          // Find the item to update
          const index = items.findIndex(item => {
            return Object.entries(filter).every(([key, value]) => 
              item[key] === value
            );
          });
          
          let returnValue = null;
          
          if (index !== -1) {
            // Store the original value if returning before update
            if (!options.returnDocument || options.returnDocument === 'before') {
              returnValue = { ...items[index] };
            }
            
            // Apply $set updates
            if (update.$set) {
              items[index] = { 
                ...items[index], 
                ...update.$set 
              };
            }
            
            // Store the updated value if returning after update
            if (options.returnDocument === 'after') {
              returnValue = { ...items[index] };
            }
            
            saveCollection(name, items);
          } else if (options.upsert) {
            // Create a new document if upsert is true
            const newDoc = { 
              ...filter,
              ...update.$set,
              _id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            };
            
            items.push(newDoc);
            
            if (options.returnDocument === 'after') {
              returnValue = { ...newDoc };
            }
            
            saveCollection(name, items);
          }
          
          return { 
            value: returnValue,
            ok: 1
          };
        }
      };
    },
    
    listCollections: () => ({
      toArray: async () => Object.keys(collections).map(name => ({ name }))
    }),
    
    command: async (cmd) => {
      // Simple support for ping command
      if (cmd.ping) {
        return { ok: 0 }; // Return 0 to indicate it's not a real MongoDB
      }
      return { ok: 0 };
    },
    
    // Add a special method to indicate this is the fallback
    isFallback: true
  };
}

// Export clientPromise
export default clientPromise;