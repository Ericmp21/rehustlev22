import mongoose from "mongoose";

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Create a mock model for client-side rendering
const createMockUserModel = () => {
  console.log("Creating mock User model for client-side");

  return {
    findOne: async () => null,
    findById: async () => null,
    find: async () => [],
    create: async (data) => ({ ...data, _id: 'mock_id' }),
    updateOne: async () => ({ modifiedCount: 0 }),
    deleteOne: async () => ({ deletedCount: 0 })
  };
};

let UserModel;

if (!isClient) {
  const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: String,
    name: String,
    trial_start_date: Date,
    is_subscribed: { type: Boolean, default: false },
    lifetime_access: { type: Boolean, default: false },
    fullName: String,
    phoneNumber: String,
    preferredCRM: { type: String, default: 'None' },
    crmAPIKey: String,
    syncAutomatically: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now }
  });

  UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
} else {
  UserModel = createMockUserModel();
}

export default UserModel;
