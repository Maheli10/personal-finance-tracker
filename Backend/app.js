import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URL;

app.use(
  cors({
    origin: "personal-finance-tracker-sepia-gamma.vercel.app",
  })
);
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Finance Tracker API is running successfully!");
});

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);

connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});