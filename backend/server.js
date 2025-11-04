import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(compression());

// Rate Limiting - Fixed for Vercel
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'https://tj-job-hub-nhfn.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from dist folder (your built frontend)
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    // Set proper MIME types
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Socket.io setup
const io = new SocketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://tj-job-hub-nhfn.vercel.app",
    methods: ["GET", "POST"]
  }
});

// Multer middleware for file uploads
import multer from 'multer';
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Session and Passport setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = (await import('./models/User.js')).default;
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Static files
app.use('/uploads', express.static('uploads'));

// Database Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Connected Successfully');
      
      try {
        const Job = (await import('./models/Job.js')).default;
        await Job.collection.dropIndex('seo.slug_1');
        console.log('✅ Dropped seo.slug unique index');
      } catch (indexError) {
        console.log('Note: No seo.slug index to drop');
      }

      const { scheduleMonthlyReset } = await import('./utils/resetUsage.js');
      scheduleMonthlyReset();
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};
connectDB();

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  socket.on('send-message', (data) => {
    socket.to(data.receiverId).emit('receive-message', data);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

// Import and use routes
const { verifyToken } = await import('./middleware/auth.js');
const authRouter = (await import('./routes/auth.js')).default;
const applicationsRouter = (await import('./routes/applications.js')).default;

app.use('/api/auth', authRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/jobs', (await import('./routes/jobs.js')).default);
app.use('/api/companies', (await import('./routes/companies.js')).default);
app.use('/api/assessments', (await import('./routes/assessments.js')).default);
app.use('/api/employer', (await import('./routes/employer.js')).default);
app.use('/api/chat', (await import('./routes/chat.js')).default);
app.use('/api/messages', (await import('./routes/messages.js')).default);
app.use('/api/profile', (await import('./routes/profile.js')).default);
app.use('/api/notifications', (await import('./routes/notifications.js')).default);
app.use('/api/subscription', (await import('./routes/subscription.js')).default);
app.use('/api/feedback', (await import('./routes/feedback.js')).default);
app.use('/api/admin', (await import('./routes/admin.js')).default);
app.use('/api/cv-revamp', (await import('./routes/cv-revamp.js')).default);
app.use('/api/ai', (await import('./routes/ai.js')).default);

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Serve React app for all non-API routes (SPA support)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/socket.io/')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : error
  });
});

// For Vercel - export the app
export default app;
