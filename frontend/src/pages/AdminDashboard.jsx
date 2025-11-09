import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import api from '../utils/api';

// API functions
const fetchAdminAnalytics = async () => {
  const response = await api.get('/admin/analytics/overview');
  return response.data;
};

const fetchUsers = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/users?${queryString}`);
  return response.data;
};

const fetchJobs = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/jobs?${queryString}`);
  return response.data;
};

const fetchFeedback = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/feedback?${queryString}`);
  return response.data;
};

const fetchSubscriptions = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/admin/subscriptions?${queryString}`);
  return response.data;
};

const fetchCvRequests = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/cv-revamp/admin?${queryString}`);
  return response.data;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Analytics query
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    'adminAnalytics',
    fetchAdminAnalytics,
    { enabled: activeTab === 'overview' }
  );

  // Users query
  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['adminUsers', { page: currentPage, search: searchTerm, ...filters }],
    () => fetchUsers({ page: currentPage, limit: 10, search: searchTerm, ...filters }),
    { enabled: activeTab === 'users', keepPreviousData: true }
  );

  // Jobs query
  const { data: jobsData, isLoading: jobsLoading } = useQuery(
    ['adminJobs', { page: currentPage, search: searchTerm, ...filters }],
    () => fetchJobs({ page: currentPage, limit: 10, search: searchTerm, ...filters }),
    { enabled: activeTab === 'jobs', keepPreviousData: true }
  );

  // Feedback query
  const { data: feedbackData, isLoading: feedbackLoading } = useQuery(
    ['adminFeedback', { page: currentPage, ...filters }],
    () => fetchFeedback({ page: currentPage, limit: 10, ...filters }),
    { enabled: activeTab === 'feedback', keepPreviousData: true }
  );

  // Subscriptions query
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery(
    ['adminSubscriptions', { page: currentPage, ...filters }],
    () => fetchSubscriptions({ page: currentPage, limit: 10, ...filters }),
    { enabled: activeTab === 'subscriptions', keepPreviousData: true }
  );

  // CV Requests query
  const { data: cvRequestsData, isLoading: cvRequestsLoading } = useQuery(
    ['adminCvRequests', { page: currentPage, ...filters }],
    () => fetchCvRequests({ page: currentPage, limit: 10, ...filters }),
    { enabled: activeTab === 'cv-requests', keepPreviousData: true }
  );

  // Mutations for CRUD operations
  const updateUserMutation = useMutation(
    ({ id, data }) => api.put(`/admin/users/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User updated successfully');
      },
      onError: (error) => {
        console.error('Update user error:', error);
        toast.error(error.response?.data?.message || 'Failed to update user');
      }
    }
  );

  const deleteUserMutation = useMutation(
    (id) => api.delete(`/admin/users/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User deleted successfully');
      },
      onError: () => toast.error('Failed to delete user')
    }
  );

  const updateJobMutation = useMutation(
    ({ id, data }) => api.put(`/admin/jobs/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminJobs');
        toast.success('Job updated successfully');
      },
      onError: () => toast.error('Failed to update job')
    }
  );

  const deleteJobMutation = useMutation(
    (id) => api.delete(`/admin/jobs/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminJobs');
        toast.success('Job deleted successfully');
      },
      onError: () => toast.error('Failed to delete job')
    }
  );

  const approveFeedbackMutation = useMutation(
    (id) => api.put(`/admin/feedback/${id}/approve`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminFeedback');
        queryClient.invalidateQueries('adminAnalytics');
        toast.success('Feedback approved successfully');
      },
      onError: (error) => {
        console.error('Approve feedback error:', error);
        toast.error(error.response?.data?.message || 'Failed to approve feedback');
      }
    }
  );

  const updateFeedbackMutation = useMutation(
    ({ id, data }) => api.put(`/admin/feedback/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminFeedback');
        toast.success('Feedback updated successfully');
      },
      onError: () => toast.error('Failed to update feedback')
    }
  );

  const deleteFeedbackMutation = useMutation(
    (id) => api.delete(`/admin/feedback/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminFeedback');
        queryClient.invalidateQueries('adminAnalytics');
        toast.success('Feedback deleted successfully');
      },
      onError: (error) => {
        console.error('Delete feedback error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete feedback');
      }
    }
  );

  const updateCvRequestMutation = useMutation(
    ({ id, data }) => api.put(`/cv-revamp/admin/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCvRequests');
        toast.success('CV request updated successfully');
      },
      onError: (error) => {
        console.error('Update CV request error:', error);
        toast.error(error.response?.data?.message || 'Failed to update CV request');
      }
    }
  );

  const deleteCvRequestMutation = useMutation(
    (id) => api.delete(`/cv-revamp/admin/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCvRequests');
        toast.success('CV request deleted successfully');
      },
      onError: (error) => {
        console.error('Delete CV request error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete CV request');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const renderOverview = () => {
    if (analyticsLoading) return <div className="text-center py-8">Loading analytics...</div>;

    const chartData = [
      { name: 'Users', value: analytics?.data?.totalUsers || 0 },
      { name: 'Job Seekers', value: analytics?.data?.totalJobSeekers || 0 },
      { name: 'Employers', value: analytics?.data?.totalEmployers || 0 },
      { name: 'Jobs', value: analytics?.data?.totalJobs || 0 },
      { name: 'Applications', value: analytics?.data?.totalApplications || 0 },
      { name: 'Active Subscriptions', value: analytics?.data?.activeSubscriptions || 0 }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-400">{analytics?.data?.totalUsers || 0}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total Jobs</h3>
            <p className="text-3xl font-bold text-green-400">{analytics?.data?.totalJobs || 0}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-purple-400">{analytics?.data?.activeSubscriptions || 0}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Feedback</h3>
          <div className="space-y-4">
            {analytics?.data?.recentFeedback?.slice(0, 5).map((feedback) => (
              <div key={feedback._id} className="border-b border-gray-700 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{feedback.name}</p>
                    <p className="text-gray-400 text-sm">{feedback.email}</p>
                    <p className="text-gray-300 mt-2">{feedback.message}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    feedback.isReviewed ? 'bg-green-600' : 'bg-yellow-600'
                  }`}>
                    {feedback.isReviewed ? 'Reviewed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    if (usersLoading) return <div className="text-center py-8">Loading users...</div>;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          <select
            value={filters.role || ''}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="job_seeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </select>
          <select
            value={filters.plan || ''}
            onChange={(e) => handleFilterChange('plan', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {usersData?.data?.users?.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.subscription?.plan || 'free'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.isActive ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => updateUserMutation.mutate({
                        id: user._id,
                        data: { isActive: !user.isActive }
                      })}
                      className={`px-3 py-1 rounded text-xs ${
                        user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => updateUserMutation.mutate({
                        id: user._id,
                        data: { subscription: { plan: user.subscription?.plan === 'pro' ? 'free' : 'pro' } }
                      })}
                      className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700"
                      disabled={updateUserMutation.isLoading}
                    >
                      {updateUserMutation.isLoading ? 'Updating...' : 'Toggle Plan'}
                    </button>
                    <button
                      onClick={() => deleteUserMutation.mutate(user._id)}
                      className="px-3 py-1 rounded text-xs bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!usersData?.data?.pagination?.hasNextPage}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderJobs = () => {
    if (jobsLoading) return <div className="text-center py-8">Loading jobs...</div>;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Posted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {jobsData?.data?.jobs?.map((job) => (
                <tr key={job._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{job.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{job.companyDetails?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.status === 'active' ? 'bg-green-600' :
                      job.status === 'paused' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {new Date(job.postedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => updateJobMutation.mutate({
                        id: job._id,
                        data: { status: job.status === 'active' ? 'paused' : 'active' }
                      })}
                      className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      {job.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteJobMutation.mutate(job._id)}
                      className="px-3 py-1 rounded text-xs bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!jobsData?.data?.pagination?.hasNextPage}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderFeedback = () => {
    if (feedbackLoading) return <div className="text-center py-8">Loading feedback...</div>;

    const approvedCount = feedbackData?.data?.feedback?.filter(item => item.status === 'approved').length || 0;

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total Feedback</h3>
            <p className="text-3xl font-bold text-blue-400">{feedbackData?.data?.pagination?.total || 0}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Approved Feedback</h3>
            <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Pending Review</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {(feedbackData?.data?.pagination?.total || 0) - approvedCount}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              placeholder="Search feedback by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="responded">Responded</option>
          </select>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="ui">UI/UX Feedback</option>
            <option value="performance">Performance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {feedbackData?.data?.feedback?.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-gray-400 text-sm">{item.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 max-w-md">
                    <div className="truncate" title={item.message}>
                      {item.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-600 rounded text-xs capitalize">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.status === 'approved' ? 'bg-green-600' :
                      item.status === 'reviewed' ? 'bg-blue-600' :
                      item.status === 'responded' ? 'bg-purple-600' :
                      'bg-yellow-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {item.status !== 'approved' && (
                      <button
                        onClick={() => approveFeedbackMutation.mutate(item._id)}
                        disabled={approveFeedbackMutation.isLoading}
                        className="px-3 py-1 rounded text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        title="Approve for display"
                      >
                        {approveFeedbackMutation.isLoading ? 'Approving...' : 'Approve'}
                      </button>
                    )}
                    <button
                      onClick={() => updateFeedbackMutation.mutate({
                        id: item._id,
                        data: { isReviewed: !item.isReviewed }
                      })}
                      className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700"
                      title={item.isReviewed ? 'Mark as pending' : 'Mark as reviewed'}
                    >
                      {item.isReviewed ? 'Unreview' : 'Review'}
                    </button>
                    {!item.isReviewed && (
                      <button
                        onClick={() => deleteFeedbackMutation.mutate(item._id)}
                        disabled={deleteFeedbackMutation.isLoading}
                        className="px-3 py-1 rounded text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        title="Delete unreviewed feedback"
                      >
                        {deleteFeedbackMutation.isLoading ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {feedbackData?.data?.pagination?.totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!feedbackData?.data?.pagination?.hasNextPage}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderCvRequests = () => {
    if (cvRequestsLoading) return <div className="text-center py-8">Loading CV requests...</div>;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              placeholder="Search CV requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filters.serviceType || ''}
            onChange={(e) => handleFilterChange('serviceType', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Services</option>
            <option value="revamp">Revamp</option>
            <option value="new">New CV</option>
          </select>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {cvRequestsData?.data?.requests?.map((request) => (
                <tr key={request._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{request.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{request.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300 capitalize">{request.serviceType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300 capitalize">{request.package}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      request.status === 'completed' ? 'bg-green-600' :
                      request.status === 'in_progress' ? 'bg-blue-600' :
                      request.status === 'cancelled' ? 'bg-red-600' :
                      'bg-yellow-600'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {request.status !== 'completed' && request.status !== 'cancelled' && (
                      <button
                        onClick={() => updateCvRequestMutation.mutate({
                          id: request._id,
                          data: { status: request.status === 'pending' ? 'in_progress' : 'completed' }
                        })}
                        className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        {request.status === 'pending' ? 'Start' : 'Complete'}
                      </button>
                    )}
                    {request.cvFile?.url && (
                      <a
                        href={request.cvFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded text-xs bg-green-600 hover:bg-green-700"
                      >
                        View CV
                      </a>
                    )}
                    <button
                      onClick={() => deleteCvRequestMutation.mutate(request._id)}
                      className="px-3 py-1 rounded text-xs bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!cvRequestsData?.data?.pagination?.hasNextPage}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderSubscriptions = () => {
    if (subscriptionsLoading) return <div className="text-center py-8">Loading subscriptions...</div>;

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {subscriptionsData?.data?.subscriptions?.map((sub) => (
                <tr key={sub._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{sub.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{sub.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{sub.subscription?.plan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {sub.subscription?.expiresAt ? new Date(sub.subscription.expiresAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      sub.subscription?.expiresAt && new Date(sub.subscription.expiresAt) > new Date()
                        ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {sub.subscription?.expiresAt && new Date(sub.subscription.expiresAt) > new Date() ? 'Active' : 'Expired'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!subscriptionsData?.data?.pagination?.hasNextPage}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-4 mb-8 bg-gray-800 p-1 rounded-lg scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'jobs', label: 'Jobs' },
            { id: 'feedback', label: 'Feedback' },
            { id: 'cv-requests', label: 'CV Requests' },
            { id: 'subscriptions', label: 'Subscriptions' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
                setSearchTerm('');
                setFilters({});
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'jobs' && renderJobs()}
        {activeTab === 'feedback' && renderFeedback()}
        {activeTab === 'cv-requests' && renderCvRequests()}
        {activeTab === 'subscriptions' && renderSubscriptions()}
      </div>
    </div>
  );
};

export default AdminDashboard;