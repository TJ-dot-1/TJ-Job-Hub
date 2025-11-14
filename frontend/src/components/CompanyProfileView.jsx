import React, { useState, useEffect } from 'react';
import {
  Building,
  Globe,
  MapPin,
  Users,
  Calendar,
  Mail,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  X,
  Linkedin,
  Twitter,
  Facebook
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const CompanyProfileView = ({ employerId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, [employerId]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/employer/profile/${employerId}`);

      if (response.data.success) {
        setProfile(response.data.data);
      } else {
        setError('Failed to load company profile');
      }
    } catch (err) {
      console.error('Error fetching company profile:', err);
      if (err.response?.status === 404) {
        setError('Company profile not found');
      } else {
        setError('Failed to load company profile');
        toast.error('Failed to load company profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading company profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
            {error === 'Company profile not found' ? 'Profile Not Available' : 'Error Loading Profile'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {error === 'Company profile not found'
              ? 'This employer hasn\'t set up a company profile yet.'
              : 'There was an error loading the company profile. Please try again.'
            }
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            {error !== 'Company profile not found' && (
              <button
                onClick={fetchCompanyProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Company Profile
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Company Header */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0">
              {profile.logo ? (
                <img
                  src={profile.logo}
                  alt={`${profile.companyName} logo`}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.companyName}
                </h3>
                {profile.isVerified && (
                  <div className="flex items-center text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                {profile.industry && (
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    {profile.industry}
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profile.location}
                  </div>
                )}

                {profile.companySize && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {profile.companySize} employees
                  </div>
                )}

                {profile.foundedYear && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Founded {profile.foundedYear}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About Section */}
          {profile.about && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                About {profile.companyName}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {profile.about}
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Globe className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Website</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      {profile.website}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </a>
              )}

              {profile.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Mail className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Contact Email</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.contactEmail}
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Social Links */}
          {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Connect With Us
              </h4>
              <div className="flex space-x-4">
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}

                {profile.socialLinks.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    title="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}

                {profile.socialLinks.facebook && (
                  <a
                    href={profile.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Profile created {new Date(profile.createdAt).toLocaleDateString()}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileView;