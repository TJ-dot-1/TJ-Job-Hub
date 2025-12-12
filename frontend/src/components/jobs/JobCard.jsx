import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Clock, Building, Heart, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const JobCard = ({ job }) => {
  const { isAuthenticated, user, monthlyUsage } = useAuth();
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [isApplying, setIsApplying] = useState(false);

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Negotiable';
    
    const min = salary.min?.toLocaleString();
    const max = salary.max?.toLocaleString();
    const period = salary.period === 'yearly' ? 'yr' : salary.period === 'monthly' ? 'mo' : 'hr';
    
    return `$${min} - $${max} / ${period}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      if (isSaved) {
        await api.delete(`/jobs/${job._id}/save`);
        setIsSaved(false);
        toast.success('Job removed from saved jobs');
      } else {
        await api.post(`/jobs/${job._id}/save`);
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Save job error:', error);
      toast.error('Error saving job');
    }
  };

  const handleQuickApply = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to apply for jobs');
      return;
    }

    if (user.role !== 'job_seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    // Check subscription limits for job seekers
    if (user.role === 'job_seeker' && monthlyUsage?.applications >= 5) {
      toast.error('Monthly application limit reached. Upgrade to Pro for unlimited applications.');
      return;
    }

    setIsApplying(true);
    try {
      await api.post('/applications', {
        jobId: job._id,
        coverLetter: `I am excited to apply for the ${job.title} position at ${job.company?.name}. I believe my skills and experience make me a strong candidate for this role.`
      });

      toast.success('Application submitted successfully!');
    } catch (error) {
      // Use error for debugging and user feedback
      console.error('Quick apply error:', error);
      if (error.response?.status === 400) {
        toast.error('You have already applied for this job');
      } else if (error.response?.status === 403 && error.response?.data?.upgradeRequired) {
        toast.error(error.response.data.reason || 'Subscription limit reached. Please upgrade.');
      } else {
        toast.error('Error submitting application');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/jobs/${job._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job opportunity: ${job.title} at ${job.company?.name}`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success('Job link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
              <Link
                to={`/jobs/${job._id}`}
                className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
              >
                {job.title}
              </Link>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={handleSaveJob}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Link
              to={`/companies/${job.company?._id}`}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-3"
            >
              <Building className="w-4 h-4 mr-2" />
              <span className="font-medium">{job.company?.name}</span>
            </Link>
          </div>
          
          {job.company?.logo && (
            <img 
              src={job.company.logo} 
              alt={job.company.name}
              className="w-12 h-12 rounded-lg object-cover ml-4"
            />
          )}
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-base sm:text-lg">{job.location}</span>
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-base sm:text-lg capitalize">{job.jobType?.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-base sm:text-lg">{formatSalary(job.salary)}</span>
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-base sm:text-lg">
              {job.deadline ? `Apply by ${formatDate(job.deadline)}` : 'Open until filled'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-4 line-clamp-3">
          {job.shortDescription || job.description}
        </p>

        {/* Skills */}
        {job.requirements?.skills && job.requirements.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.requirements.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-base rounded-md capitalize"
              >
                {skill.name}
              </span>
            ))}
            {job.requirements.skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-base rounded-md">
                +{job.requirements.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-100 dark:border-gray-700 gap-4 sm:gap-0">
          <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
            <span>Posted {formatDate(job.postedAt)}</span>
            {job.metadata?.views > 0 && (
              <>
                <span className="hidden sm:inline mx-2">•</span>
                <span>{job.metadata.views} views</span>
              </>
            )}
            {job.metadata?.applications > 0 && (
              <>
                <span className="hidden sm:inline mx-2">•</span>
                <span>{job.metadata.applications} applications</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Link
              to={`/jobs/${job._id}`}
              className="px-4 py-2 text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              View Details
            </Link>

            {isAuthenticated && user.role === 'job_seeker' && (
              <button
                onClick={handleQuickApply}
                disabled={isApplying || (user.role === 'job_seeker' && monthlyUsage?.applications >= 5)}
                className={`px-4 py-2 text-base sm:text-lg font-medium rounded-lg transition-colors ${
                  user.role === 'job_seeker' && monthlyUsage?.applications >= 5
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                    : 'text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title={user.role === 'job_seeker' && monthlyUsage?.applications >= 5 ? 'Monthly limit reached. Upgrade to Pro.' : ''}
              >
                {isApplying ? 'Applying...' : user.role === 'job_seeker' && monthlyUsage?.applications >= 5 ? 'Limit Reached' : 'Quick Apply'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;