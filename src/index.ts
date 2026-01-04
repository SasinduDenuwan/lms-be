import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRouter from "./routes/auth.route";
import instructorRouter from "./routes/instructor.route";
import courseRouter from "./routes/course.route";
import cartRouter from "./routes/cart.route";
import studentRouter from "./routes/student.route";
import paymentRouter from "./routes/payment.route";
import orderRouter from "./routes/order.route";
import chatRouter from "./routes/chat.route";

dotenv.config();

const app = express();

// ── PORT & MongoDB URI ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000; // fallback for local dev
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in environment variables!");
  process.exit(1);
}

// ── MIDDLEWARE ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" })); // increase limit if you handle big payloads

// Simplified and Robust CORS configuration
app.use(
  cors({
    origin: ["https://lms-fe-lrhe.vercel.app", "http://localhost:5173"], // Allow production and local frontend
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
    credentials: true,
  })
);

// Database connection function for Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  if (!MONGO_URI) {
    console.error("MONGO_URI is not defined!");
    throw new Error("MONGO_URI is not defined");
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ── ROUTES ───────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/instructor", instructorRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/chat", chatRouter);

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server error:", err);
    res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    });
  }
);

// ── SERVER START (Only if running directly) ──────────────────────────
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  });
}

export default app;
