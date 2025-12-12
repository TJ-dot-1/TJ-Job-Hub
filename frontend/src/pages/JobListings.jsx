import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Filter, MapPin, Briefcase, DollarSign, Clock, Building } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import JobSearch from '../components/jobs/JobSearch';
import SubscriptionStatus from '../components/SubscriptionStatus';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';

const JobListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    jobType: searchParams.get('jobType') || '',
    remotePolicy: searchParams.get('remotePolicy') || '',
    minSalary: searchParams.get('minSalary') || '',
    experience: searchParams.get('experience') || '',
    page: parseInt(searchParams.get('page')) || 1
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data, isLoading, error } = useQuery(
    ['jobs', filters],
    () => fetchJobs(filters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  );

  const fetchJobs = async (filters) => {
    try {
      const params = new URLSearchParams();
      
      // Add all filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/jobs?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch jobs');
      }
      
      return response.data.data; // Return the data object
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  };

  const handleSearch = (newFilters) => {
    const updatedFilters = { ...newFilters, page: 1 };
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);

    // Scroll to top when search changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (key, value) => {
    const updatedFilters = {
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    };
    setFilters(updatedFilters);

    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== '') {
        params.set(filterKey, filterValue.toString());
      }
    });
    setSearchParams(params);

    // Scroll to top when filters change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error loading jobs</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Subscription Status */}
        <SubscriptionStatus />

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Your Dream Job</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Discover {data?.total || 0} job opportunities that match your skills and aspirations
          </p>
        </div>

        {/* Search and Filters */}
        <JobSearch onSearch={handleSearch} initialFilters={filters} />

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Quick Filters
              </h3>

              <div className="space-y-6">
                {/* Job Type Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Job Type</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="jobType"
                        checked={filters.jobType === ''}
                        onChange={() => handleFilterChange('jobType', '')}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Any</span>
                    </label>
                    {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="jobType"
                          checked={filters.jobType === type}
                          onChange={() => handleFilterChange('jobType', type)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {type.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Remote Policy Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Remote Policy</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="remotePolicy"
                        checked={filters.remotePolicy === ''}
                        onChange={() => handleFilterChange('remotePolicy', '')}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Any</span>
                    </label>
                    {['remote', 'hybrid', 'on-site'].map(policy => (
                      <label key={policy} className="flex items-center">
                        <input
                          type="radio"
                          name="remotePolicy"
                          checked={filters.remotePolicy === policy}
                          onChange={() => handleFilterChange('remotePolicy', policy)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {policy.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(filters.jobType || filters.remotePolicy || filters.category || filters.minSalary || filters.experience) && (
                  <button
                    onClick={() => handleSearch({
                      query: filters.query,
                      location: filters.location,
                      category: '',
                      jobType: '',
                      remotePolicy: '',
                      minSalary: '',
                      experience: '',
                      page: 1
                    })}
                    className="w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
                  <p className="text-gray-600 dark:text-gray-300">
                    Showing {data?.jobs?.length || 0} of {data?.total || 0} jobs
                    {filters.query && ` for "${filters.query}"`}
                    {filters.location && ` in ${filters.location}`}
                  </p>
                </div>

                {/* Jobs Grid */}
                {data?.jobs?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {data.jobs.map(job => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 mb-4">
                      Try adjusting your search criteria or browse all jobs.
                    </p>
                    <button
                      onClick={() => handleSearch({})}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Browse All Jobs
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {data?.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page <= 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      {[...Array(data.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show limited pages with ellipsis
                        if (
                          pageNumber === 1 ||
                          pageNumber === data.totalPages ||
                          (pageNumber >= filters.page - 1 && pageNumber <= filters.page + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filters.page === pageNumber
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (pageNumber === filters.page - 2 || pageNumber === filters.page + 2) {
                          return <span key={pageNumber} className="px-2 text-gray-500 dark:text-gray-400">...</span>;
                        }
                        return null;
                      })}

                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page >= data.totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListings;