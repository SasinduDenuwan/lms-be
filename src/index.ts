import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRouter from './routes/auth.route';
import instructorRouter from './routes/instructor.route';
import courseRouter from './routes/course.route';
import cartRouter from './routes/cart.route';
import studentRouter from './routes/student.route';
import paymentRouter from './routes/payment.route';
import orderRouter from './routes/order.route';
import chatRouter from './routes/chat.route';

dotenv.config();

const app = express();

// ── PORT & MongoDB URI ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000; // fallback for local dev
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables!');
  process.exit(1);
}

// ── MIDDLEWARE ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' })); // increase limit if you handle big payloads

// More robust CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman)
      // Allow all vercel.app domains (very useful for preview deployments!)
      if (!origin || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        const allowedOrigins = [
          'https://lms-fe-lrhe.vercel.app',
          // add any other production domains you might have later
        ];
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    credentials: true,          // ← important if using cookies or auth headers
    optionsSuccessStatus: 204,  // some older browsers need this
  })
);

// Handle preflight requests explicitly (helps on some hosting platforms)
// app.options('*', cors());

// ── ROUTES ───────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/instructor', instructorRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/student', studentRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/chat', chatRouter);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

// ── DATABASE & SERVER START ──────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });