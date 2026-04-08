import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  type: String,
  message: String,
  ip: String,
  hash: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Log", logSchema);