import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, //store the user ID inside the transactions collection
  type: {
    type: String,
    enum: ["income", "expense"], //enum: only allow specific values
  },
  amount: Number,
  category: String,
  date: {
    type: Date,
    default: Date.now, //automatically sets current date/time
  },
});

export default mongoose.model("Transaction", transactionSchema);