import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    logData: Object,
    hash: String,
    verified: { type: Boolean, default: true },
    txHash: String,
    blockNumber: Number
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);