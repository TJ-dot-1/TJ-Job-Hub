import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  MapPin, 
  Globe, 
  Users, 
  Calendar, 
  Briefcase, 
  Mail, 
  Phone, 
  ArrowLeft,
  Building,
  ExternalLink,
  Star,
  Share2
} from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';

const CompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');

  const { data: company, isLoading, error } = useQuery(
    ['company', id],
    () => fetchCompany(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );

  const fetchCompany = async (companyId) => {
    const response = await api.get(`/companies/${companyId}`);
    return response.data.data;
  };

  const { data: companyJobs } = useQuery(
    ['companyJobs', id],
    () => fetchCompanyJobs(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    }
  );

  const fetchCompanyJobs = async (companyId) => {
    const response = await api.get(`/jobs/company/${companyId}`);
    return response.data.data;
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
            Company Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The company you're looking for doesn't exist or may have been removed.
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

  if (!company) {
    return null;
  }

  const stats = [
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: 'Open Positions',
      value: companyJobs?.length || 0
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Company Size',
      value: company.size || 'Not specified'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Founded',
      value: company.foundedYear || 'Not specified'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Location',
      value: company.headquarters || 'Not specified'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              {/* Company Logo */}
              <div className="flex-shrink-0 mb-4 md:mb-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {company.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                      {company.tagline || company.industry}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          Website
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                      {company.email && (
                        <a
                          href={`mailto:${company.email}`}
                          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Contact
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Follow
                    </button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center text-gray-400 mb-1">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Company Details
              </h3>
              
              <div className="space-y-4">
                {company.industry && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Industry</h4>
                    <p className="text-gray-900 dark:text-white">{company.industry}</p>
                  </div>
                )}
                
                {company.headquarters && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Headquarters</h4>
                    <p className="text-gray-900 dark:text-white">{company.headquarters}</p>
                  </div>
                )}
                
                {company.size && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Size</h4>
                    <p className="text-gray-900 dark:text-white">{company.size}</p>
                  </div>
                )}
                
                {company.foundedYear && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Founded</h4>
                    <p className="text-gray-900 dark:text-white">{company.foundedYear}</p>
                  </div>
                )}
                
                {company.techStack && company.techStack.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-1">
                      {company.techStack.slice(0, 5).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {company.techStack.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{company.techStack.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              {(company.email || company.phone) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Contact
                  </h4>
                  <div className="space-y-2">
                    {company.email && (
                      <a
                        href={`mailto:${company.email}`}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {company.email}
                      </a>
                    )}
                    {company.phone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {company.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'about', label: 'About' },
                    { id: 'jobs', label: `Open Positions (${companyJobs?.length || 0})` },
                    { id: 'reviews', label: 'Reviews' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      About {company.name}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      {company.description || 'No company description available.'}
                    </p>

                    {company.mission && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Our Mission</h4>
                        <p className="text-gray-700 dark:text-gray-300">{company.mission}</p>
                      </div>
                    )}

                    {company.culture && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Company Culture</h4>
                        <p className="text-gray-700 dark:text-gray-300">{company.culture}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                      Open Positions at {company.name}
                    </h3>
                    
                    {companyJobs?.length > 0 ? (
                      <div className="space-y-4">
                        {companyJobs.map(job => (
                          <JobCard key={job._id} job={job} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Open Positions
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          This company doesn't have any open positions at the moment.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                      Employee Reviews
                    </h3>
                    <div className="text-center py-12">
                      <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Reviews Yet
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Be the first to review this company.
                      </p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Write a Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;