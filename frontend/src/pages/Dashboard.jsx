import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Briefcase,
  Users,
  BarChart3,
  MessageSquare,
  Eye,
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  DollarSign,
  MapPin,
  Bot,
  Sparkles
} from 'lucide-react';
import CompanyProfileForm from '../components/employer/CompanyProfileForm';
import SubscriptionStatus from '../components/SubscriptionStatus';
import RecruiterAssistant from '../components/ai/RecruiterAssistant';
import CareerAssistant from '../components/ai/CareerAssistant';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import MessageModal from '../components/MessageModal';
import ApplicantDetailsModal from '../components/ApplicantDetailsModal';

const Dashboard = () => {
  const { user, isEmployer, isJobSeeker } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewScheduled: 0,
    hired: 0
  });
  const [hasRedirected, setHasRedirected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [recentApplications, setRecentApplications] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [messageModal, setMessageModal] = useState({ isOpen: false, applicant: null, job: null });
  const [applicantDetailsModal, setApplicantDetailsModal] = useState({ isOpen: false, application: null });
  const [interviewModal, setInterviewModal] = useState({ isOpen: false, application: null });

  // Redirect if not employer
  useEffect(() => {
    if (user && !isEmployer && !hasRedirected) {
      setHasRedirected(true);
      if (user.role === 'job_seeker') {
        navigate('/dashboard/jobseeker', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, isEmployer, hasRedirected, navigate]);

  // Fetch real data from API
  useEffect(() => {
    if (isEmployer) {
      fetchDashboardData();
    }
  }, [isEmployer]);

  // Fetch jobs data when jobs tab is selected
  useEffect(() => {
    if (isEmployer && activeTab === 'jobs' && allJobs.length === 0) {
      fetchAllJobs();
    }
  }, [isEmployer, activeTab, allJobs.length]);

  // Fetch applications data when applications tab is selected
  useEffect(() => {
    if (isEmployer && activeTab === 'applications' && allApplications.length === 0) {
      fetchAllApplications();
    }
  }, [isEmployer, activeTab, allApplications.length]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await api.get('/employer/dashboard/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch recent applications
      const applicationsResponse = await api.get('/employer/dashboard/applications?limit=5');
      if (applicationsResponse.data.success) {
        setRecentApplications(applicationsResponse.data.data);
      }

      // Fetch active jobs
      const jobsResponse = await api.get('/employer/dashboard/jobs?status=active&limit=3');
      if (jobsResponse.data.success) {
        setActiveJobs(jobsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
      }
      // Keep default empty states but show error toast if available
      if (window.toast) {
        window.toast.error(error.response?.data?.message || 'Error loading dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await api.get('/employer/jobs', {
        params: { page: 1, limit: 50 }
      });
      if (response.data.success) {
        setAllJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      if (window.toast) {
        window.toast.error(error.response?.data?.message || 'Error loading jobs');
      }
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchAllApplications = async (search = '', status = '', jobId = '') => {
    try {
      setApplicationsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (jobId) params.jobId = jobId;

      const response = await api.get('/employer/applications', { params });
      if (response.data.success) {
        setAllApplications(response.data.applications);
      }
    } catch (error) {
      console.error('Error fetching all applications:', error);
      if (window.toast) {
        window.toast.error(error.response?.data?.message || 'Error loading applications');
      }
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleSearchApplications = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchAllApplications(value, statusFilter, jobFilter);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    fetchAllApplications(searchTerm, value, jobFilter);
  };

  const handleJobFilter = (e) => {
    const value = e.target.value;
    setJobFilter(value);
    fetchAllApplications(searchTerm, statusFilter, value);
  };

  const handleExportApplications = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (jobFilter) params.jobId = jobFilter;

      const response = await api.get('/employer/applications/export', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applications-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Applications exported successfully');
    } catch (error) {
      console.error('Error exporting applications:', error);
      toast.error('Failed to export applications');
    }
  };

  const handlePauseJob = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'paused' ? 'active' : 'paused';
      const response = await api.put(`/jobs/${jobId}/status`, { status: newStatus });

      if (response.data.success) {
        toast.success(`Job ${newStatus === 'paused' ? 'paused' : 'activated'} successfully`);
        // Refresh jobs data
        fetchAllJobs();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error(error.response?.data?.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/jobs/${jobId}`);

      if (response.data.success) {
        toast.success('Job deleted successfully');
        // Refresh jobs data
        fetchAllJobs();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleMessageApplicant = (applicant, job) => {
    setMessageModal({ isOpen: true, applicant, job });
  };

  const closeMessageModal = () => {
    setMessageModal({ isOpen: false, applicant: null, job: null });
  };

  const handleViewApplicant = (application) => {
    setApplicantDetailsModal({ isOpen: true, application });
  };

  const closeApplicantDetailsModal = () => {
    setApplicantDetailsModal({ isOpen: false, application: null });
  };

  const openInterviewModal = (application) => {
    setInterviewModal({ isOpen: true, application });
  };

  const closeInterviewModal = () => {
    setInterviewModal({ isOpen: false, application: null });
  };

  const handleScheduleInterview = async (applicationId, interviewData) => {
    try {
      const response = await api.post(`/employer/applications/${applicationId}/interview`, interviewData);

      if (response.data.success) {
        toast.success('Interview scheduled successfully');
        closeInterviewModal();
        // Refresh applications data
        fetchAllApplications(searchTerm, statusFilter, jobFilter);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus, interviewDate = null) => {
    try {
      const updateData = { status: newStatus };
      if (interviewDate) {
        updateData.interviewDate = interviewDate;
      }

      const response = await api.put(`/employer/applications/${applicationId}/status`, updateData);

      if (response.data.success) {
        toast.success(`Application status updated to ${newStatus}`);
        // Refresh applications data
        fetchAllApplications(searchTerm, statusFilter, jobFilter);
        fetchDashboardData(); // Update stats
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error(error.response?.data?.message || 'Failed to update application status');
    }
  };


  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      reviewed: Eye,
      interview: Calendar,
      accepted: CheckCircle,
      rejected: XCircle
    };
    return icons[status] || Clock;
  };

  // Early return with loading state
  if (user && !isEmployer && !hasRedirected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!isEmployer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Employer dashboard access required.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEmployer ? 'Employer Dashboard' : 'Job Seeker Dashboard'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Welcome back, {user?.company?.name || user?.name}
              </p>
            </div>
            {isEmployer && (
              <button
                onClick={() => navigate('/post-job')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Post New Job</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Subscription Status */}
        <SubscriptionStatus />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeJobs}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Real-time data</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalApplications}</p>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Live updates</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interviews</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.interviewScheduled}</p>
                      </div>
                      <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                        <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Real-time scheduling</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hired</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.hired}</p>
                      </div>
                      <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Dynamic metrics</span>
                    </div>
                  </div>
              </div>
          </>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex overflow-x-auto space-x-4 px-6 scrollbar-hide">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                ...(isEmployer ? [
                  { id: 'jobs', name: 'Job Posts', icon: Briefcase },
                  { id: 'applications', name: 'Applications', icon: Users },
                  { id: 'ai-assistant', name: 'AI Assistant', icon: Bot },
                  { id: 'company-profile', name: 'Company Profile', icon: Building }
                ] : [
                  { id: 'applications', name: 'My Applications', icon: FileText },
                  { id: 'ai-assistant', name: 'AI Assistant', icon: Bot },
                  { id: 'cv-revamp', name: 'CV Revamp', icon: FileText }
                ]),
                { id: 'messages', name: 'Messages', icon: MessageSquare }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Recent Applications */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Applications
                    </h2>
                    <button 
                      onClick={() => setActiveTab('applications')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View all applications
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    {recentApplications.length > 0 ? recentApplications.map((application) => {
                      const StatusIcon = getStatusIcon(application.status);
                      return (
                        <div key={application._id} className="p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-white dark:hover:bg-gray-600/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                  {application.applicant?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {application.applicant?.name || 'Unknown Applicant'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {application.applicant?.title || 'Applicant'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  Applied for {application.job?.title || 'Job'} • {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown date'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {application.match || 85}% match
                                  </span>
                                  <div className="flex items-center text-yellow-500">
                                    <span className="text-sm font-medium">{application.rating || 0}</span>
                                    <span>⭐</span>
                                  </div>
                                </div>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleMessageApplicant(application.applicant, application.job)}
                                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  title="Message applicant"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                  <FileText className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent applications</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Jobs */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Active Job Posts
                    </h2>
                    <button 
                      onClick={() => setActiveTab('jobs')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View all jobs
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {activeJobs.length > 0 ? activeJobs.map((job) => (
                      <div key={job._id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {job.location}
                            </p>
                          </div>
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full">
                            Active
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-2" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {job.jobType?.replace('-', ' ') || 'Full-time'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {job.salary?.min ? `$${job.salary.min.toLocaleString()} - $${job.salary.max?.toLocaleString() || 'Negotiable'}` : 'Negotiable'}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {job.metadata?.applications || 0} apps
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {job.metadata?.views || 0} views
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => setActiveTab('applications')}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            View Applications
                          </button>
                          <button className="p-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-12">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No active jobs
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Post your first job to get started.
                        </p>
                        <button
                          onClick={() => navigate('/post-job')}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Post a Job
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Job Posts
                  </h2>
                  <div className="flex space-x-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search jobs..."
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Filter className="w-4 h-4" />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>
                
                {jobsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    {allJobs.length > 0 ? allJobs.map((job) => (
                      <div key={job._id} className="p-6 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {job.title}
                                </h3>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  <span>{job.category}</span>
                                  <span>•</span>
                                  <span>{job.location}</span>
                                  <span>•</span>
                                  <span>{job.jobType?.replace('-', ' ')}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {job.metadata?.applications || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
                              </div>

                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {job.metadata?.views || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 ml-6">
                            <button
                              onClick={() => navigate(`/edit-job/${job._id}`)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handlePauseJob(job._id, job.status)}
                              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium"
                            >
                              {job.status === 'paused' ? 'Activate' : 'Pause'}
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job._id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No jobs found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Applications
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={handleSearchApplications}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilter}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select
                      value={jobFilter}
                      onChange={handleJobFilter}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                    >
                      <option value="">All Jobs</option>
                      {allJobs.map(job => (
                        <option key={job._id} value={job._id}>{job.title}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleExportApplications}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
                
                {applicationsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading applications...</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    {allApplications.length > 0 ? allApplications.map((application) => {
                      const StatusIcon = getStatusIcon(application.status);
                      return (
                        <div key={application._id} className="p-6 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                  {application.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {application.user?.name || 'Unknown Applicant'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {application.user?.title || 'Applicant'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                  {application.user?.email || 'No email'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                  {application.job?.title || 'Unknown Job'}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {application.aiMatch?.score || 85}% match
                                  </span>
                                  <div className="flex items-center text-yellow-500">
                                    <span className="text-sm font-medium mr-1">{application.rating?.score || 0}</span>
                                    <span>⭐</span>
                                  </div>
                                </div>
                              </div>

                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                              </div>

                              <div className="flex items-center space-x-2">
                                {/* Status Action Buttons */}
                                <div className="flex items-center space-x-1 mr-2">
                                  <button
                                    onClick={() => handleStatusUpdate(application._id, 'reviewed')}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                      application.status === 'reviewed'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-yellow-900/20'
                                    }`}
                                    title="Mark as reviewed"
                                  >
                                    Review
                                  </button>
                                  <button
                                    onClick={() => openInterviewModal(application)}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                      application.status === 'interview'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-purple-900/20'
                                    }`}
                                    title="Schedule interview"
                                  >
                                    Interview
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(application._id, 'accepted')}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                      application.status === 'accepted'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-green-900/20'
                                    }`}
                                    title="Accept application"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                      application.status === 'rejected'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-red-900/20'
                                    }`}
                                    title="Reject application"
                                  >
                                    Reject
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleMessageApplicant(application.user, application.job)}
                                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  title="Message applicant"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (application.resume?.previewUrl) {
                                      window.open(application.resume.previewUrl, '_blank');
                                    } else if (application.resume?.url) {
                                      window.open(application.resume.url, '_blank');
                                    } else {
                                      toast.error('Resume not available');
                                    }
                                  }}
                                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  title="View resume preview"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                {application.resume?.url && (
                                  <button
                                    onClick={() => window.open(application.resume.url, '_blank')}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    title="Download resume"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleViewApplicant(application)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No applications found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* AI Assistant Tab */}
            {activeTab === 'ai-assistant' && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEmployer ? 'AI Recruiter Assistant' : 'AI Career Assistant'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {isEmployer
                          ? 'Get AI-powered help with job descriptions, candidate screening, and recruitment strategies'
                          : 'Get AI-powered help with career guidance, CV optimization, and job search strategies'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                {isEmployer ? <RecruiterAssistant /> : <CareerAssistant />}
              </div>
            )}

            {/* Company Profile Tab */}
            {activeTab === 'company-profile' && (
              <div className="max-w-4xl mx-auto">
                <CompanyProfileForm />
              </div>
            )}

            {/* CV Revamp Tab */}
            {activeTab === 'cv-revamp' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    CV Revamp
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Get AI-powered help to optimize your resume and improve your job search success.
                  </p>
                  <button onClick={() => navigate('/cv-revamp')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Start CV Revamp
                  </button>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Messages
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your candidate messages will appear here.
                </p>
                <button onClick={() => navigate('/messages')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Start a Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={closeMessageModal}
        applicant={messageModal.applicant}
        job={messageModal.job}
      />

      {/* Applicant Details Modal */}
      <ApplicantDetailsModal
        isOpen={applicantDetailsModal.isOpen}
        onClose={closeApplicantDetailsModal}
        application={applicantDetailsModal.application}
        onMessage={handleMessageApplicant}
      />

      {/* Interview Scheduling Modal */}
      {interviewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Schedule Interview
              </h3>
              <button
                onClick={closeInterviewModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interview Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="interviewDateTime"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interview Type
                </label>
                <select
                  id="interviewType"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="phone">Phone Interview</option>
                  <option value="video">Video Interview</option>
                  <option value="onsite">On-site Interview</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location/Platform
                </label>
                <input
                  type="text"
                  id="interviewLocation"
                  placeholder="e.g., Zoom, Office, Phone"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="interviewNotes"
                  rows="3"
                  placeholder="Additional notes for the interview..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeInterviewModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const dateTime = document.getElementById('interviewDateTime').value;
                  const type = document.getElementById('interviewType').value;
                  const location = document.getElementById('interviewLocation').value;
                  const notes = document.getElementById('interviewNotes').value;

                  if (!dateTime) {
                    toast.error('Please select a date and time');
                    return;
                  }

                  if (!location.trim()) {
                    toast.error('Please specify the location/platform');
                    return;
                  }

                  const interviewData = {
                    scheduledAt: new Date(dateTime).toISOString(),
                    type,
                    location: location.trim(),
                    notes: notes.trim()
                  };

                  handleScheduleInterview(interviewModal.application._id, interviewData);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;