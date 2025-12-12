import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building,
  Globe,
  ArrowLeft,
  Share2,
  Bookmark,
  Users,
  Calendar,
  CheckCircle,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import CompanyProfileView from '../components/CompanyProfileView';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [showCompanyProfile, setShowCompanyProfile] = useState(false);

  const { data: job, isLoading, error } = useQuery(
    ['job', id],
    () => fetchJob(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchJob = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data.data;
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to apply for this job');
      navigate('/login');
      return;
    }

    if (user.role !== 'job_seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    setIsApplying(true);
    try {
      await api.post('/applications', {
        jobId: id,
        coverLetter: `I am excited to apply for the ${job.title} position at ${job.companyDetails.name}. I believe my skills and experience make me a strong candidate for this role.`
      });

      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Apply error:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'You have already applied for this job');
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save jobs');
      navigate('/login');
      return;
    }

    try {
      // Toggle save status
      // const response = await api.post(`/jobs/${id}/save`);
      toast.success('Job saved to your favorites!');
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title} at ${job.companyDetails.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Job Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The job you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
  const isOwner = user && job.createdBy === user._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {job.title}
                      </h1>
                      <div className="flex items-center space-x-4 mb-4">
                        <Link
                          to={`/companies/${job.company._id}`}
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Building className="w-4 h-4 mr-1" />
                          {job.companyDetails.name}
                        </Link>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        {job.remotePolicy && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.remotePolicy === 'remote' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : job.remotePolicy === 'hybrid'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {job.remotePolicy.charAt(0).toUpperCase() + job.remotePolicy.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 mb-4 md:mb-0">
                      <button
                        onClick={handleShare}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="Share job"
                      >
                        <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={handleSaveJob}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="Save job"
                      >
                        <Bookmark className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Job Meta */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span className="capitalize">{job.jobType?.replace('-', ' ')}</span>
                    </div>
                    {job.employmentLevel && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="capitalize">{job.employmentLevel}</span>
                      </div>
                    )}
                    {job.salary?.min && job.salary?.max && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}</span>
                      </div>
                    )}
                    {job.postedAt && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Apply Button */}
                  {!isOwner && (
                    <button
                      onClick={handleApply}
                      disabled={isApplying || isExpired}
                      className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isApplying ? (
                        <span className="flex items-center justify-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          Applying...
                        </span>
                      ) : isExpired ? (
                        'Application Closed'
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Job Description
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {(job.requirements?.skills?.length > 0 || job.requirements?.experience) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Requirements & Qualifications
                </h2>
                
                {job.requirements.experience && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Experience</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {job.requirements.experience.min && job.requirements.experience.max
                        ? `${job.requirements.experience.min} - ${job.requirements.experience.max} years`
                        : job.requirements.experience.min
                        ? `Minimum ${job.requirements.experience.min} years`
                        : job.requirements.experience.max
                        ? `Up to ${job.requirements.experience.max} years`
                        : 'Experience not specified'}
                    </p>
                  </div>
                )}

                {job.requirements.skills?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Benefits & Perks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Company Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  About the Company
                </h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                    {job.companyDetails.logo ? (
                      <img
                        src={job.companyDetails.logo}
                        alt={job.companyDetails.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {job.companyDetails.name}
                    </h4>
                    {job.companyDetails.industry && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.companyDetails.industry}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowCompanyProfile(true)}
                  className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Company Profile
                </button>
              </div>

              {/* Job Details */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Job Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Job Type</span>
                    <span className="text-gray-900 dark:text-white font-medium capitalize">
                      {job.jobType?.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Location</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {job.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Remote Policy</span>
                    <span className="text-gray-900 dark:text-white font-medium capitalize">
                      {job.remotePolicy?.replace('-', ' ')}
                    </span>
                  </div>
                  {job.applicationDeadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Application Deadline</span>
                      <span className={`font-medium ${
                        isExpired 
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                        {isExpired && ' (Expired)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Salary Information */}
              {job.salary && (job.salary.min || job.salary.max) && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Salary
                  </h3>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {job.salary.min && job.salary.max
                        ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                        : job.salary.min
                        ? `From $${job.salary.min.toLocaleString()}`
                        : `Up to $${job.salary.max.toLocaleString()}`}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      per {job.salary.period || 'year'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company Profile Modal */}
      {showCompanyProfile && (
        <CompanyProfileView
          employerId={job.company._id}
          onClose={() => setShowCompanyProfile(false)}
        />
      )}
    </div>
  );
};

export default JobDetails;