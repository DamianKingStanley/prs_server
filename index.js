import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import postRoute from "./routes/postRoute.js";
import userRoute from "./routes/userRoute.js";
import recommendationRoute from "./routes/recommendationRoute.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
dotenv.config();

// middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URL);
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

startServer();

app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/receipts", express.static(path.join(__dirname, "receipts")));

app.use("/", postRoute);
app.use("/", userRoute);

app.use("/", recommendationRoute);
