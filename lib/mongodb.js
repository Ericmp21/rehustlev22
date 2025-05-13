import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI");
}

// Parse username from URI for logging purposes only
try {
  if (MONGODB_URI.includes('@')) {
    const credentialPart = MONGODB_URI.split('@')[0].split('//')[1];
    if (credentialPart && credentialPart.includes(':')) {
      const username = credentialPart.split(':')[0];
      console.log(`Using MongoDB with username: ${username}`);
    }
  }
} catch (error) {
  // Ignore parsing errors
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log("Using cached database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Use these options for more reliable connection
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    console.log("Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        // Return a "mock mongoose" that won't crash but won't do anything
        // This allows the app to continue running without a database
        return createMockMongoose();
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error("Error resolving MongoDB connection:", e);
    throw e;
  }
}

// Creates a mock Mongoose that won't crash but won't do anything
// Used as a fallback when MongoDB connection fails
function createMockMongoose() {
  console.warn("Using mock Mongoose (no database persistence)");
  
  // In-memory storage for collections
  const collections = {};
  
  // Initialize with empty collections
  const knownCollections = ['users', 'deals', 'accounts'];
  knownCollections.forEach(name => {
    collections[name] = [];
  });
  
  // Try to load from localStorage or global memory
  if (typeof window !== 'undefined' && window.localStorage) {
    knownCollections.forEach(name => {
      try {
        const data = localStorage.getItem(`rehustle_${name}`);
        if (data) {
          collections[name] = JSON.parse(data);
          console.log(`Loaded ${collections[name].length} items from localStorage for ${name}`);
        }
      } catch (e) {
        console.error(`Error loading ${name} from localStorage:`, e);
      }
    });
  } else if (typeof global !== 'undefined' && global._localDbStorage) {
    knownCollections.forEach(name => {
      try {
        const data = global._localDbStorage[`rehustle_${name}`];
        if (data) {
          collections[name] = JSON.parse(data);
          console.log(`Loaded ${collections[name].length} items from server memory for ${name}`);
        }
      } catch (e) {
        console.error(`Error loading ${name} from server memory:`, e);
      }
    });
  }
  
  // Save data helper
  const saveCollection = (name, data) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`rehustle_${name}`, JSON.stringify(data));
    } else if (typeof global !== 'undefined') {
      if (!global._localDbStorage) {
        global._localDbStorage = {};
      }
      global._localDbStorage[`rehustle_${name}`] = JSON.stringify(data);
    }
  };
  
  // Mock mongoose object with minimum required functionality
  return {
    // This is what we return from mongoose.connect()
    connection: {
      readyState: 1, // Connected
    },
    models: {},
    model: (name, schema) => {
      if (!collections[name]) {
        collections[name] = [];
      }
      
      // Return a mock model that works with MongoDB-like queries
      const model = {
        findOne: async (query) => {
          console.log(`[MockDB] findOne in ${name}:`, query);
          const found = collections[name].find(doc => 
            Object.entries(query).every(([key, value]) => doc[key] === value)
          );
          return found ? {...found} : null;
        },
        
        find: async (query) => {
          console.log(`[MockDB] find in ${name}:`, query);
          return collections[name].filter(doc =>
            Object.entries(query).every(([key, value]) => doc[key] === value)
          );
        },
        
        create: async (data) => {
          console.log(`[MockDB] create in ${name}:`, data);
          const _id = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const newDoc = { ...data, _id };
          collections[name].push(newDoc);
          saveCollection(name, collections[name]);
          return { ...newDoc };
        },
        
        findByIdAndUpdate: async (id, update, options) => {
          console.log(`[MockDB] findByIdAndUpdate in ${name}:`, id, update);
          const index = collections[name].findIndex(doc => doc._id === id);
          if (index === -1) {
            if (options?.upsert) {
              const newDoc = { ...update, _id: id };
              collections[name].push(newDoc);
              saveCollection(name, collections[name]);
              return newDoc;
            }
            return null;
          }
          
          // Apply updates
          if (update.$set) {
            collections[name][index] = { ...collections[name][index], ...update.$set };
          } else {
            // Direct update
            collections[name][index] = { ...collections[name][index], ...update };
          }
          
          saveCollection(name, collections[name]);
          return { ...collections[name][index] };
        },
        
        updateOne: async (filter, update) => {
          console.log(`[MockDB] updateOne in ${name}:`, filter, update);
          const index = collections[name].findIndex(doc => 
            Object.entries(filter).every(([key, value]) => doc[key] === value)
          );
          
          if (index !== -1) {
            if (update.$set) {
              collections[name][index] = { ...collections[name][index], ...update.$set };
            } else {
              collections[name][index] = { ...collections[name][index], ...update };
            }
            saveCollection(name, collections[name]);
            return { modifiedCount: 1, acknowledged: true };
          }
          
          return { modifiedCount: 0, acknowledged: true };
        },
        
        deleteOne: async (filter) => {
          console.log(`[MockDB] deleteOne in ${name}:`, filter);
          const initialLength = collections[name].length;
          collections[name] = collections[name].filter(doc => 
            !Object.entries(filter).every(([key, value]) => doc[key] === value)
          );
          
          if (initialLength !== collections[name].length) {
            saveCollection(name, collections[name]);
          }
          
          return { deletedCount: initialLength - collections[name].length, acknowledged: true };
        }
      };
      
      // Store in models cache
      if (!this.models[name]) {
        this.models[name] = model;
      }
      
      return model;
    }
  };
}

export default dbConnect;