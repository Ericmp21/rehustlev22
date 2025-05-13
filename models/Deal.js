import mongoose from "mongoose";

const DealSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  property_type: String,
  sniper_score: Number,
  risk_level: String,
  recommended_offer: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// 🔥 FORCE overwrite of cached Deal model
delete mongoose.models.Deal;

export default mongoose.model("Deal", DealSchema);