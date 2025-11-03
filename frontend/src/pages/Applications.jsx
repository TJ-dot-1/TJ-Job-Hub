import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Clock4,
  Eye,
  MessageSquare,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, differenceInDays } from 'date-fns';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import Notifications from '../components/Notifications';

const statusConfig = {
  applied: {
    label: 'Applied',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: Clock4
  },
  reviewed: {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: Eye
  },
  interview: {
    label: 'Interview',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: MessageSquare
  },
  offer: {
    label: 'Offer',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle
  }
};

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  });

  // Fetch applications from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/my-applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
      // Fallback to empty array
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    calculateStats();
    filterApplications();
  }, [applications, searchTerm, statusFilter, sortBy]);

  const calculateStats = () => {
    const newStats = {
      total: applications.length,
      applied: applications.filter(app => app.status === 'applied').length,
      interview: applications.filter(app => app.status === 'interview').length,
      offer: applications.filter(app => app.status === 'offer').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    setStats(newStats);
  };

  const filterApplications = () => {
    let filtered = applications.filter(application =>
      application.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job?.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(application => application.status === statusFilter);
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0);
        case 'oldest':
          return new Date(a.appliedDate || 0) - new Date(b.appliedDate || 0);
        case 'company':
          return (a.job?.company || '').localeCompare(b.job?.company || '');
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const dateObj = new Date(date);
    if (isToday(dateObj)) {
      return 'Today';
    } else if (isYesterday(dateObj)) {
      return 'Yesterday';
    } else if (isThisWeek(dateObj)) {
      return format(dateObj, 'EEEE');
    } else {
      return format(dateObj, 'MMM dd, yyyy');
    }
  };

  const getDaysAgo = (date) => {
    if (!date) return 'Unknown';
    const days = differenceInDays(new Date(), new Date(date));
    return days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.applied;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const ApplicationCard = ({ application }) => {
    const isExpanded = expandedApplication === application.id;
    const config = statusConfig[application.status] || statusConfig.applied;
    const StatusIcon = config.icon;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                {application.job?.company?.split(' ').map(word => word[0]).join('') || 'CO'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {application.job?.title || 'Untitled Position'}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {application.job?.company && (
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {application.job.company}
                    </span>
                  )}
                  {application.job?.location && (
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {application.job.location}
                    </span>
                  )}
                  {application.job?.type && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {application.job.type}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <StatusBadge status={application.status} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Applied {formatDate(application.appliedDate)}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setExpandedApplication(isExpanded ? null : application.id)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* Next Step */}
          {application.nextStep && application.nextStep !== 'None' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Next: {application.nextStep}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Details */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Application Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Applied Date</label>
                    <p className="text-gray-900 dark:text-white">
                      {application.appliedDate ? format(new Date(application.appliedDate), 'MMMM dd, yyyy') : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                    <p className="text-gray-900 dark:text-white">{getDaysAgo(application.lastUpdated)}</p>
                  </div>
                  {application.job?.salary && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Salary Range</label>
                      <p className="text-gray-900 dark:text-white">{application.job.salary}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents & Notes */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Documents & Notes</h4>
                <div className="space-y-3">
                  {application.resume && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Resume</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 dark:text-white">{application.resume}</span>
                        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {application.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                      <p className="text-gray-900 dark:text-white text-sm">{application.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Letter Preview */}
            {application.coverLetter && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cover Letter</h4>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-32 overflow-y-auto">
                  <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                View Job Posting
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                Contact Recruiter
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                Add Note
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Job Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track and manage all your job applications in one place
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Notifications />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.applied}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Applied</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">{stats.interview}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Interview</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.offer}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Offer</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{stats.rejected}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="reviewed">Under Review</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="company">Company A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map(application => (
              <ApplicationCard key={application.id} application={application} />
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {applications.length === 0 ? 'No applications yet' : 'No applications found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {applications.length === 0 
                  ? 'Start applying to jobs to see your applications here'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {applications.length === 0 && (
                <button 
                  onClick={() => window.location.href = '/jobs'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;