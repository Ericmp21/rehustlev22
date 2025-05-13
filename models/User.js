import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  name: String,
  trial_start_date: Date,
  is_subscribed: { type: Boolean, default: false },
  lifetime_access: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);