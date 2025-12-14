import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './contexts/ToastContext';

// Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorFallback from './components/ui/ErrorFallback';

// Pages
import JobListings from './pages/JobListings';
import JobDetails from './pages/JobDetails';
import CompanyProfile from './pages/CompanyProfile';
import Companies from './pages/Companies';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import EditJob from './pages/EditJob';
import Pricing from './pages/Pricing';
import Payment from './pages/Payment';
import PaymentPending from './pages/PaymentPending';
import Recruit from './pages/Recruit';
import CareerAdvice from './pages/CareerAdvice';
import Assessments from './pages/Assessments';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminDashboard from './pages/AdminDashboard';
import CvRevamp from './pages/CvRevamp';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import BettingDashboard from './pages/BettingDashboard';
import BettingHistory from './pages/BettingHistory';
import Wallet from './pages/Wallet';
import AviatorGame from './components/betting/AviatorGame';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Role-based route wrapper
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    if (user?.role === 'employer') {
      return <Navigate to="/dashboard" />;
    } else if (user?.role === 'job_seeker') {
      return <Navigate to="/dashboard/jobseeker" />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin" />;
    } else {
      return <Navigate to="/jobs" />;
    }
  }

  return children;
};

// Employer-only route wrapper
const EmployerRoute = ({ children }) => {
  return <RoleBasedRoute allowedRoles={['employer']}>{children}</RoleBasedRoute>;
};

// Job seeker-only route wrapper
const JobSeekerRoute = ({ children }) => {
  return <RoleBasedRoute allowedRoles={['job_seeker']}>{children}</RoleBasedRoute>;
};

// Admin-only route wrapper
const AdminRoute = ({ children }) => {
  return <RoleBasedRoute allowedRoles={['admin']}>{children}</RoleBasedRoute>;
};

// Simple 404 component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-4">Page not found</p>
      <a href="/" className="text-blue-600 hover:text-blue-700">Go to Jobs</a>
    </div>
  </div>
);

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyProfile />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription/pending"
            element={
              <ProtectedRoute>
                <PaymentPending />
              </ProtectedRoute>
            }
          />
          <Route path="/recruit" element={<Recruit />} />
          <Route path="/career-advice" element={<CareerAdvice />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cv-revamp" element={<CvRevamp />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <EmployerRoute>
                <Dashboard />
              </EmployerRoute>
            }
          />
          <Route
            path="/dashboard/jobseeker"
            element={
              <JobSeekerRoute>
                <JobSeekerDashboard />
              </JobSeekerRoute>
            }
          />
          <Route
            path="/post-job"
            element={
              <EmployerRoute>
                <PostJob />
              </EmployerRoute>
            }
          />
          <Route
            path="/edit-job/:id"
            element={
              <EmployerRoute>
                <EditJob />
              </EmployerRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Betting Routes */}
          <Route
            path="/betting"
            element={
              <ProtectedRoute>
                <BettingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/betting/aviator"
            element={
              <ProtectedRoute>
                <AviatorGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/betting/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/betting/history"
            element={
              <ProtectedRoute>
                <BettingHistory />
              </ProtectedRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <SocketProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </SocketProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;