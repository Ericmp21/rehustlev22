import mongoose from "mongoose";

const DealSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  property_type: String,
  propertyAddress: { type: String, default: '' }, // ✅ added
  sniper_score: Number,
  risk_level: String,
  recommended_offer: Number,
  purchasePrice: { type: Number, default: 0 },     // ✅ optional fallback
  marketValue: { type: Number, default: 0 },       // ✅ optional fallback
  notes: { type: String, default: '' },            // ✅ updated with default
}, { timestamps: true });

// 🔥 FORCE overwrite of cached Deal model
delete mongoose.models.Deal;

export default mongoose.model("Deal", DealSchema);
