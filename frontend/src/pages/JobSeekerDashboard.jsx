import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  FileText,
  Briefcase,
  TrendingUp,
  Bell,
  Sparkles,
  CheckCircle,
  Clock,
  Eye,
  Star,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  Bot,
  MessageSquare,
  Bookmark,
  AlertCircle
} from 'lucide-react';
import CareerAssistant from '../components/ai/CareerAssistant';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Dashboard data states
  const [stats, setStats] = useState({
    applicationsSent: 0,
    interviewsScheduled: 0,
    profileViews: 0,
    profileCompleteness: 0
  });
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user stats
      const statsResponse = await api.get('/profile/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch applications
      const applicationsResponse = await api.get('/applications/my-applications');
      if (applicationsResponse.data.success) {
        setApplications(applicationsResponse.data.applications);
      }

      // Fetch recommended jobs
      const recommendedResponse = await api.get('/jobs/recommended');
      if (recommendedResponse.data.success) {
        setRecommendedJobs(recommendedResponse.data.jobs);
      }

      // Fetch notifications
      const notificationsResponse = await api.get('/notifications');
      if (notificationsResponse.data.success) {
        setNotifications(notificationsResponse.data.notifications);
      }

      // Fetch saved jobs
      const savedResponse = await api.get('/jobs/saved');
      if (savedResponse.data.success) {
        setSavedJobs(savedResponse.data.jobs);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      rejected: AlertCircle
    };
    return icons[status] || Clock;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Job Seeker Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                Welcome back, {user?.name}
              </p>
            </div>
            <button
              onClick={() => navigate('/cv-revamp')}
              className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">CV Revamp</span>
              <span className="sm:hidden">CV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications Sent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.applicationsSent}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Active applications</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interviews Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.interviewsScheduled}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-purple-600 dark:text-purple-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Upcoming interviews</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.profileViews}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Profile visibility</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Completeness</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.profileCompleteness}%</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                <User className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
              <Star className="w-4 h-4 mr-1" />
              <span>Complete your profile</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm mb-6 sm:mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex overflow-x-auto space-x-6 px-4 scrollbar-hide">
                {[
                  { id: 'overview', name: 'Overview', icon: TrendingUp },
                  { id: 'profile', name: 'Profile Overview', icon: User },
                  { id: 'applications', name: 'My Applications', icon: FileText },
                  { id: 'recommended', name: 'Recommended Jobs', icon: Briefcase },
                  { id: 'saved', name: 'Saved Jobs', icon: Bookmark },
                  { id: 'ai-assistant', name: 'AI Assistant', icon: Bot },
                  { id: 'notifications', name: 'Notifications', icon: Bell }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span>{tab.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => navigate('/jobs')}
                      className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-left w-full"
                    >
                      <Search className="w-8 h-8 mb-2" />
                      <h3 className="font-semibold mb-1 text-base">Find Jobs</h3>
                      <p className="text-sm opacity-90">Browse and apply to new opportunities</p>
                    </button>
                    <button
                      onClick={() => navigate('/profile')}
                      className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-left w-full"
                    >
                      <User className="w-8 h-8 mb-2" />
                      <h3 className="font-semibold mb-1 text-base">Update Profile</h3>
                      <p className="text-sm opacity-90">Improve your profile completeness</p>
                    </button>
                    <button
                      onClick={() => navigate('/cv-revamp')}
                      className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors text-left w-full"
                    >
                      <Sparkles className="w-8 h-8 mb-2" />
                      <h3 className="font-semibold mb-1 text-base">CV Revamp</h3>
                      <p className="text-sm opacity-90">Get AI-powered CV optimization</p>
                    </button>
                  </div>

                  {/* Recent Applications */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Applications
                      </h2>
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-medium text-left sm:text-right"
                      >
                        View all applications
                      </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      {applications.slice(0, 3).length > 0 ? applications.slice(0, 3).map((application) => {
                        const StatusIcon = getStatusIcon(application.status);
                        return (
                          <div key={application._id} className="p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-white dark:hover:bg-gray-600/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-white">
                                    {application.job?.title || 'Job Title'}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {application.job?.company?.name || 'Company Name'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Applied {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown date'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No recent applications</p>
                          <button
                            onClick={() => navigate('/jobs')}
                            className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            Browse jobs
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommended Jobs */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        Recommended for You
                      </h2>
                      <button
                        onClick={() => setActiveTab('recommended')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-medium text-left sm:text-right"
                      >
                        View all recommendations
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {recommendedJobs.slice(0, 3).length > 0 ? recommendedJobs.slice(0, 3).map((job) => (
                        <div key={job._id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base truncate">
                                {job.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {job.company?.name || 'Company'}
                              </p>
                            </div>
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full ml-2 flex-shrink-0">
                              Recommended
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{job.jobType?.replace('-', ' ') || 'Full-time'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{job.salary?.min ? `$${job.salary.min.toLocaleString()} - $${job.salary.max?.toLocaleString() || 'Negotiable'}` : 'Negotiable'}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      )) : (
                        <div className="col-span-full text-center py-12">
                          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No recommendations yet
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Complete your profile to get personalized job recommendations.
                          </p>
                          <button
                            onClick={() => navigate('/profile')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Update Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Overview Tab */}
              {activeTab === 'profile' && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {user?.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          {user?.profile?.headline || 'Add a professional headline'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Personal Information</h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Email:</span> {user?.email}</p>
                          <p><span className="font-medium">Location:</span> {user?.profile?.location?.city || 'Not specified'}</p>
                          <p><span className="font-medium">Phone:</span> {user?.profile?.phone || 'Not specified'}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Professional Summary</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user?.profile?.bio || 'Add a professional bio to stand out to employers.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => navigate('/profile')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => navigate('/cv-revamp')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Revamp CV
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Applications Tab */}
              {activeTab === 'applications' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      My Applications
                    </h2>
                  </div>

                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    {applications.length > 0 ? applications.map((application) => {
                      const StatusIcon = getStatusIcon(application.status);
                      return (
                        <div key={application._id} className="p-6 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {application.job?.title || 'Job Title'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {application.job?.company?.name || 'Company Name'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                  Applied {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown date'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                              </div>

                              <button
                                onClick={() => navigate(`/jobs/${application.job?._id}`)}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                View Job
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No applications yet</p>
                        <button
                          onClick={() => navigate('/jobs')}
                          className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Browse jobs
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Jobs Tab */}
              {activeTab === 'recommended' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recommended Jobs
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {recommendedJobs.length > 0 ? recommendedJobs.map((job) => (
                      <div key={job._id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {job.company?.name || 'Company'}
                            </p>
                          </div>
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full">
                            Recommended
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

                        <button
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-12">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No recommendations yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Complete your profile to get personalized job recommendations.
                        </p>
                        <button
                          onClick={() => navigate('/profile')}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Update Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Saved Jobs Tab */}
              {activeTab === 'saved' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Saved Jobs
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {savedJobs.length > 0 ? savedJobs.map((job) => (
                      <div key={job._id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {job.company?.name || 'Company'}
                            </p>
                          </div>
                          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2 py-1 rounded-full">
                            Saved
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

                        <button
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-12">
                        <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No saved jobs yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Save jobs you're interested in to review them later.
                        </p>
                        <button
                          onClick={() => navigate('/jobs')}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Browse Jobs
                        </button>
                      </div>
                    )}
                  </div>
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
                          AI Career Assistant
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Get AI-powered help with career guidance, CV optimization, and job search strategies
                        </p>
                      </div>
                    </div>
                  </div>
                  <CareerAssistant />
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h2>
                  </div>

                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    {notifications.length > 0 ? notifications.map((notification) => (
                      <div key={notification._id} className="p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;