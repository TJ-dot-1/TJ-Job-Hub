import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Calendar, FileText, Download, ExternalLink, Globe, Github, Linkedin, Twitter, User } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const ApplicantDetailsModal = ({ isOpen, onClose, application, onMessage }) => {
  const [applicantData, setApplicantData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && application?.user?._id) {
      fetchApplicantDetails();
    }
  }, [isOpen, application]);

  const fetchApplicantDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/profile/${application.user._id}`);
      if (response.data.success) {
        setApplicantData(response.data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch applicant details:', error);
      // Fallback to application data if profile fetch fails
      setApplicantData(application.user);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !application) return null;

  const applicant = applicantData || application.user;
  const job = application.job;

  const handleDownloadResume = () => {
    const resumeUrl = applicant?.profile?.resume || application.resume?.url;
    if (resumeUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = `resume-${applicant?.name || 'applicant'}.pdf`; // Default to .pdf extension
      link.target = '_blank'; // Open in new tab as fallback
      link.rel = 'noopener noreferrer';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Resume download started');
    } else {
      toast.error('Resume not available for download');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Applicant Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Applicant Header */}
              <div className="flex items-start space-x-4 mb-6">
                {applicant?.profile?.avatar ? (
                  <img
                    src={applicant.profile.avatar}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                      {applicant?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {applicant?.name || 'Unknown Applicant'}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {applicant?.profile?.headline || applicant?.title || 'Applicant'}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {applicant?.email || 'No email'}
                    </div>
                    {applicant?.profile?.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {applicant.profile.phone}
                      </div>
                    )}
                    {applicant?.profile?.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {applicant.profile.location}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onMessage(applicant, job)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>

              {/* Application Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Application Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Applied for:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{job?.title || 'Unknown Job'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Applied on:</span>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      application.status === 'reviewed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      application.status === 'interview' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      application.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Match Score:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{application.aiMatch?.score || application.match || 85}%</p>
                  </div>
                </div>
              </div>

          {/* About Me */}
          {applicant?.profile?.bio && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">About Me</h5>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{applicant.profile.bio}</p>
              </div>
            </div>
          )}

          {/* Social Links */}
          {(applicant?.profile?.website || applicant?.profile?.socialLinks) && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Social Links</h5>
              <div className="flex flex-wrap gap-3">
                {applicant?.profile?.website && (
                  <a
                    href={applicant.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
                {applicant?.profile?.socialLinks?.linkedin && (
                  <a
                    href={applicant.profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
                {applicant?.profile?.socialLinks?.github && (
                  <a
                    href={applicant.profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Github className="w-4 h-4" />
                    <span className="text-sm">GitHub</span>
                  </a>
                )}
                {applicant?.profile?.socialLinks?.twitter && (
                  <a
                    href={applicant.profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-500"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm">Twitter</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {applicant?.profile?.skills && applicant.profile.skills.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Skills</h5>
              <div className="flex flex-wrap gap-2">
                {applicant.profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    {typeof skill === 'object' ? skill.name : skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {applicant?.profile?.experience && applicant.profile.experience.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Experience</h5>
              <div className="space-y-3">
                {applicant.profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-200 dark:border-blue-700 pl-4">
                    <h6 className="font-medium text-gray-900 dark:text-white">{exp.title}</h6>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {exp.startDate && new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : exp.endDate && new Date(exp.endDate).toLocaleDateString()}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {applicant?.profile?.education && applicant.profile.education.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Education</h5>
              <div className="space-y-3">
                {applicant.profile.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-green-200 dark:border-green-700 pl-4">
                    <h6 className="font-medium text-gray-900 dark:text-white">{edu.degree}</h6>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {edu.startDate && new Date(edu.startDate).toLocaleDateString()} - {edu.current ? 'Present' : edu.endDate && new Date(edu.endDate).toLocaleDateString()}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Cover Letter</h5>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Resume */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {(applicant?.profile?.resume || application.resume?.url) ? 'Resume available' : 'Resume not uploaded by applicant'}
              </span>
            </div>
            {(applicant?.profile?.resume || application.resume?.url) && (
              <button
                onClick={handleDownloadResume}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </button>
            )}
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailsModal;