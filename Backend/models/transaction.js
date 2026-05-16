import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  title: String,
  type: {
    type: String,
    enum: ["income", "expense"],
  },
  amount: Number,
  category: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Transaction", transactionSchema);