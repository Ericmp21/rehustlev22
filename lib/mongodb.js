// Mock MongoDB client for development without actual MongoDB connection
// This is a temporary solution until the real MongoDB connection is set up

// Mock database collections
const mockCollections = {
  users: [
    {
      _id: '1',
      email: 'test@example.com',
      password: '$2a$12$1MmDsKBN8PSHurQFPdux7OiAZEj53p.IkJCnbKGJcwYCNIsloQIcW', // hashed 'password123'
      name: 'Test User',
      createdAt: new Date()
    }
  ]
};

// Mock client that simulates basic MongoDB operations
const mockClient = {
  db: () => ({
    collection: (name) => ({
      findOne: async (query) => {
        // Simulate findOne operation for the users collection
        if (name === 'users') {
          return mockCollections.users.find(user => 
            (query.email && user.email === query.email) || 
            (query._id && user._id === query._id)
          );
        }
        return null;
      },
      insertOne: async (doc) => {
        // Simulate insertOne operation
        const newId = (mockCollections[name]?.length + 1).toString() || '1';
        const newDoc = { _id: newId, ...doc };
        
        if (!mockCollections[name]) {
          mockCollections[name] = [];
        }
        
        mockCollections[name].push(newDoc);
        return { insertedId: newId };
      }
    })
  })
};

// Create a promise that resolves to our mock client
const clientPromise = Promise.resolve(mockClient);

console.log('Using mock MongoDB client for development');

export default clientPromise;