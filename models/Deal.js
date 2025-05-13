import mongoose from "mongoose";

const DealSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    validate: {
      validator: v => typeof v === "string",
      message: props => `${props.value} is not a valid string userId!`
    }
  },
  property_type: String,
  sniper_score: Number,
  risk_level: String,
  recommended_offer: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Deal || mongoose.model("Deal", DealSchema);