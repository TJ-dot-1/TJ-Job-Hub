 # TJ Job Portal


 LIVE LINK: https://tj-job-hub.vercel.app
 
 ![MERN](https://img.shields.io/badge/MERN_Stack-0A0A0A?style=for-the-badge&logo=react&logoColor=61DAFB) ![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-7.5+-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-171515?style=for-the-badge&logo=github&logoColor=white)


 
 A modern, AI-enhanced job portal built with the MERN stack that connects job seekers with employers. Features real-time messaging, AI-powered CV optimization, career assistance, and comprehensive job management tools.
## ✨ Key Features

### 🤖 AI-Powered Features
- **CV Optimization** - AI-powered resume enhancement and optimization
- **Career Assistant** - Personalized career guidance and advice
- **Interview Preparation** - AI-generated interview questions and tips
- **Recruiter Assistant** - AI tools for employers to streamline hiring
- **Job Recommendations** - AI-powered job matching based on profile
- **Assessment Tools** - Skills assessment and career evaluation

### 💼 For Job Seekers
- **Advanced Job Search** - Filter jobs by location, salary, type, and more
- **Profile Management** - Complete profile with skills, experience, and portfolio
- **Application Tracking** - Monitor application status and progress
- **Real-time Messaging** - Direct communication with employers
- **Dashboard Analytics** - Track job search progress and insights
- **Saved Jobs** - Bookmark interesting job opportunities
- **Company Reviews** - View and rate companies
- **Career Resources** - Access to career advice and tips

### 🏢 For Employers
- **Job Posting** - Create and manage job listings with detailed requirements
- **Candidate Management** - Review applications and manage hiring pipeline
- **Company Profile** - Build employer brand with company information
- **Analytics Dashboard** - Track hiring metrics and performance
- **Subscription Management** - Manage premium features and billing
- **Bulk Messaging** - Communicate with multiple candidates
- **Application Analytics** - Detailed insights into hiring funnel

### 🔄 Real-time Features
- **Live Chat System** - Real-time messaging between users
- **Instant Notifications** - Push notifications for important updates
- **Socket.io Integration** - Real-time communication infrastructure

### 📊 Additional Features
- **Admin Dashboard** - Comprehensive admin panel for system management
- **Payment Integration** - Secure payment processing with Stripe
- **Multi-role Authentication** - Support for job seekers, employers, and admins
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Progressive Web App** - PWA support for offline functionality
- **PDF Generation** - Generate CVs and reports as PDFs
- **Speech Recognition** - Voice search and commands
- **Image Upload** - Profile pictures and document uploads with optimization

## � Table of Contents
- [Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks and concurrent features
- **Vite** - Fast build tool and development server with HMR
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Router DOM** - Declarative routing for React applications
- **TanStack Query** - Powerful data synchronization for React
- **Socket.io Client** - Real-time bidirectional communication
- **Framer Motion** - Production-ready motion library for React
- **React Hook Form** - Performant forms with easy validation
- **React Hot Toast** - Beautiful toast notifications
- **React Error Boundary** - Error boundary component for React
- **React Intersection Observer** - React implementation of the Intersection Observer API
- **React Speech Recognition** - Speech recognition interface for React
- **Lucide React** - Beautiful & consistent icon toolkit
- **Recharts** - Composable charting library built on React components
- **HTML2Canvas** - Screenshots with JavaScript
- **jsPDF** - Client-side JavaScript PDF generation
- **Date-fns** - Modern JavaScript date utility library
- **Axios** - Promise based HTTP client for the browser
- **Web Vitals** - Essential metrics for a healthy site

### Backend
- **Node.js** - JavaScript runtime built on Chrome's V8 engine
- **Express.js** - Fast, unopinionated web framework for Node.js
- **MongoDB** - NoSQL document database
- **Mongoose** - Elegant MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing function
- **Passport.js** - Authentication middleware for Node.js
- **Socket.io** - Real-time bidirectional event-based communication
- **Multer** - Middleware for handling multipart/form-data
- **Nodemailer** - Easy as cake e-mail sending from Node.js
- **Stripe** - Payment processing platform
- **ImageKit & Cloudinary** - Real-time image optimization and transformation
- **OpenAI** - AI and machine learning platform
- **Redis** - In-memory data structure store
- **Elasticsearch** - Distributed search and analytics engine
- **Node-cron** - Task scheduling for Node.js
- **Helmet** - Security middleware for Express
- **CORS** - Cross-Origin Resource Sharing middleware
- **Express Rate Limit** - Rate limiting middleware
- **Express Validator** - Middleware for validation and sanitization
- **Compression** - Gzip compression middleware
- **Moment.js** - Parse, validate, manipulate, and display dates

### DevOps & Deployment
- **Vercel** - Frontend deployment platform
- **Render** - Backend hosting and deployment
- **MongoDB Atlas** - Cloud-hosted MongoDB service
- **GitHub Actions** - CI/CD automation
- **Vite PWA Plugin** - Progressive Web App support

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18 or higher
- **MongoDB** 7.0 or higher (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tj-job-portal.git
   cd tj-job-portal
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Configure your variables (see Environment Variables section)
   ```

5. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## ⚙️ Environment Variables

### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/tj-job-portal

# Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-imagekit-id

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key

# Session Secret
SESSION_SECRET=your-session-secret-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=TJ Job Portal
```

## 📁 Project Structure

```
tj-job-portal/
├── backend/                    # Node.js/Express backend
│   ├── config/                # Configuration files
│   │   ├── database.js        # MongoDB connection
│   │   ├── imagekit.js        # ImageKit configuration
│   │   └── stripe.js          # Stripe payment config
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── subscription.js   # Subscription middleware
│   │   └── upload.js         # File upload middleware
│   ├── models/               # MongoDB models
│   │   ├── User.js           # User model
│   │   ├── Job.js            # Job posting model
│   │   ├── Application.js    # Job application model
│   │   ├── Company.js        # Company model
│   │   └── CvRequest.js      # CV optimization requests
│   ├── routes/               # API route handlers
│   │   ├── auth.js           # Authentication routes
│   │   ├── jobs.js           # Job management routes
│   │   ├── applications.js   # Application routes
│   │   ├── ai.js             # AI service routes
│   │   └── cv-revamp.js      # CV optimization routes
│   ├── utils/                # Utility functions
│   │   ├── aiService.js      # OpenAI integration
│   │   ├── emailService.js   # Email services
│   │   └── imageKit.js       # Image processing
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   └── vercel.json           # Vercel deployment config
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ai/          # AI-related components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── jobs/        # Job-related components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # Base UI components
│   │   ├── contexts/        # React contexts
│   │   │   ├── AuthContext.jsx    # Authentication context
│   │   │   ├── SocketContext.jsx  # Socket.io context
│   │   │   └── ThemeContext.jsx   # Theme context
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route components
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── profile/     # Profile pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CvRevamp.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── JobSeekerDashboard.jsx
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # App entry point
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   ├── tailwind.config.js   # Tailwind CSS config
│   ├── vite.config.js       # Vite configuration
│   └── vercel.json          # Vercel deployment config
├── image/                   # Static images
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 📚 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/forgot-password` | Forgot password |
| POST | `/api/auth/reset-password` | Reset password |

### Job Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs with filters |
| GET | `/api/jobs/:id` | Get job details |
| POST | `/api/jobs` | Create new job (Employer) |
| PUT | `/api/jobs/:id` | Update job (Employer) |
| DELETE | `/api/jobs/:id` | Delete job (Employer) |
| GET | `/api/jobs/recommendations` | AI job recommendations |

### Application Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit application |
| GET | `/api/applications` | Get user applications |
| GET | `/api/applications/:id` | Get application details |
| PUT | `/api/applications/:id/status` | Update application status |

### AI & CV Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cv-revamp` | CV optimization service |
| POST | `/api/ai/career-advice` | Career guidance |
| POST | `/api/ai/interview-prep` | Interview preparation |

### Real-time Features
- **WebSocket Connection:** `ws://localhost:5000`
- **Chat Events:** `join-room`, `send-message`, `receive-message`
- **Notification Events:** Real-time updates for applications and messages

**Complete API documentation available at:** `/api/docs` when server is running
## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend
npm run build
vercel --prod
```

### Render (Backend)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically from main branch

### MongoDB Atlas
1. Create a cluster in MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in environment variables

### Environment Setup for Production
Ensure all production environment variables are set:
- Database connection string
- JWT secrets
- API keys for external services
- Email configuration
- Payment processing keys

## 🤝 Contributing

We love your input! We want to make contributing to TJ Job Portal as easy and transparent as possible.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new functionality
- Update documentation accordingly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- 📚 [Full Documentation](https://docs.tj-jobportal.com)
- 🎥 [Video Tutorials](https://youtube.com/tj-jobportal)
- 💬 [API Reference](https://api.tj-jobportal.com)

### Community
- 🐛 [Bug Reports](https://github.com/your-username/tj-job-portal/issues)
- 💡 [Feature Requests](https://github.com/your-username/tj-job-portal/discussions)
- 📖 [User Guide](https://docs.tj-jobportal.com/user-guide)

### Professional Support
- 📧 **Email:** josiejosiah89@gmail.com
- 💼 **Enterprise:** enterprise@tj-jobportal.com
- 🔧 **Technical:** tech@tj-jobportal.com

---

Built with ❤️ for connecting talent with opportunity
