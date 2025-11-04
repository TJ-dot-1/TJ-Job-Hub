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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Trust proxy for rate limiting (important for Vercel deployment)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

// Enhanced CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'], // Support both default and alternate Vite ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer middleware for file uploads
import multer from 'multer';
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Make multer available globally
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Pre-flight OPTIONS handling
app.options('*', cors());

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
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

// Static Files
app.use('/uploads', express.static('uploads'));

// Serve favicon.ico from frontend dist
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/favicon.ico'));
});

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tj-job-portal');

    // Drop the problematic unique index if it exists
    try {
      const Job = (await import('./models/Job.js')).default;
      await Job.collection.dropIndex('seo.slug_1');
      console.log('✅ Dropped seo.slug unique index');
    } catch (indexError) {
      // Index might not exist, which is fine
      console.log('Note: No seo.slug index to drop');
    }

    console.log('✅ MongoDB Connected Successfully');

    // Initialize monthly usage reset scheduler
    const { scheduleMonthlyReset } = await import('./utils/resetUsage.js');
    scheduleMonthlyReset();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
connectDB();

// Socket.io for Real-time Features
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

// Store io instance for use in routes
app.set('io', io);

// Import auth middleware
const { verifyToken } = await import('./middleware/auth.js');

// Routes
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

// Simple demo routes for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Demo jobs endpoint
app.get('/api/jobs', async (req, res) => {
  // Demo jobs data
  const jobs = [
    {
      _id: '1',
      title: 'Frontend Developer',
      company: {
        name: 'Tech Corp',
        logo: ''
      },
      location: 'Remote',
      jobType: 'full-time',
      salary: {
        min: 60000,
        max: 90000,
        currency: 'USD',
        period: 'yearly'
      },
      description: 'We are looking for a skilled Frontend Developer with experience in modern JavaScript frameworks. You will be responsible for building responsive web applications and collaborating with our design team.',
      requirements: {
        skills: [
          { name: 'React', required: true },
          { name: 'JavaScript', required: true },
          { name: 'CSS', required: true },
          { name: 'HTML', required: true }
        ]
      },
      postedAt: new Date(),
      metadata: {
        views: 150,
        applications: 25
      }
    },
    {
      _id: '2',
      title: 'Backend Developer',
      company: {
        name: 'Data Systems',
        logo: ''
      },
      location: 'New York, NY',
      jobType: 'full-time',
      salary: {
        min: 80000,
        max: 120000,
        currency: 'USD',
        period: 'yearly'
      },
      description: 'Join our backend team to build scalable APIs and microservices. Experience with cloud platforms and database design is required.',
      requirements: {
        skills: [
          { name: 'Node.js', required: true },
          { name: 'MongoDB', required: true },
          { name: 'Express', required: true },
          { name: 'AWS', required: false }
        ]
      },
      postedAt: new Date(),
      metadata: {
        views: 200,
        applications: 35
      }
    },
    {
      _id: '3',
      title: 'Product Manager',
      company: {
        name: 'Innovate Inc',
        logo: ''
      },
      location: 'San Francisco, CA',
      jobType: 'full-time',
      salary: {
        min: 100000,
        max: 150000,
        currency: 'USD',
        period: 'yearly'
      },
      description: 'Lead product development from conception to launch. Work with cross-functional teams to deliver exceptional user experiences.',
      requirements: {
        skills: [
          { name: 'Product Management', required: true },
          { name: 'Agile', required: true },
          { name: 'User Research', required: true }
        ]
      },
      postedAt: new Date(),
      metadata: {
        views: 180,
        applications: 42
      }
    }
  ];

  res.json({
    success: true,
    jobs,
    total: jobs.length,
    totalPages: 1,
    currentPage: 1
  });
});

// Error Handling Middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : error
  });
});

// Serve React app for non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }

  // Serve the React app's index.html for all other routes
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const startServer = async (retries = 3) => {
  const PORT = process.env.PORT || 5000;
  
  try {
    await new Promise((resolve, reject) => {
      server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
        console.log(`💼 Employer endpoints: http://localhost:${PORT}/api/employer`);
        console.log(`💬 Chat endpoints: http://localhost:${PORT}/api/chat`);
        console.log(`📝 Application endpoints: http://localhost:${PORT}/api/applications`);
        resolve();
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${PORT} is already in use`));
        } else {
          reject(err);
        }
      });
    });
  } catch (error) {
    if (retries > 0 && error.message.includes('already in use')) {
      const nextPort = parseInt(PORT) + 1;
      console.log(`Port ${PORT} is busy, trying port ${nextPort}...`);
      process.env.PORT = nextPort.toString();
      await startServer(retries - 1);
    } else {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  }
};

startServer();
