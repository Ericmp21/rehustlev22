import mongoose from "mongoose";

const DealSchema = new mongoose.Schema({
  // Define userId as String type and explicitly tell Mongoose not to try casting it
  userId: { 
    type: String, 
    required: true,
    get: v => String(v),
    set: v => String(v)
  },
  property_type: String,
  sniper_score: Number,
  risk_level: String,
  recommended_offer: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now },
}, { 
  timestamps: true,
  // Add _id: false to the schema options if we're explicitly setting IDs
  toObject: { getters: true },
  toJSON: { getters: true }
});

// Force Mongoose to use plain strings for userId
DealSchema.path('userId').validate(function(value) {
  // Always store as string
  return typeof value === 'string';
}, 'userId must be a string');

export default mongoose.models.Deal || mongoose.model("Deal", DealSchema);