import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Trash2, Building, GraduationCap, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const EditJob = () => {
  const { id } = useParams();
  const { user, isEmployer, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category: '',
    jobType: 'full-time',
    employmentLevel: 'mid',
    location: '',
    remotePolicy: 'on-site',
    salary: {
      min: '',
      max: '',
      currency: 'USD',
      period: 'yearly'
    },
    requirements: {
      experience: {
        min: '',
        max: ''
      },
      skills: [''],
      education: [''],
      certifications: [''],
      languages: ['']
    },
    benefits: [''],
    applicationProcess: {
      questions: [''],
      requiresCoverLetter: false,
      requiresResume: true
    },
    deadline: '',
    tags: ['']
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch job after component mounted and auth state is known
    if (mounted && id && isAuthenticated && isEmployer) {
      fetchJob();
    }
  }, [mounted, id, isAuthenticated, isEmployer]);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        toast.error('Please log in to edit jobs');
        navigate('/login');
      } else if (!isEmployer) {
        toast.error('Employer account required to edit jobs');
        navigate('/dashboard');
      }
    }
  }, [mounted, isAuthenticated, isEmployer, navigate]);

  const fetchJob = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/jobs/${id}`);
      if (response.data.success) {
        const job = response.data.data;

        // Check if user owns this job (handle populated company object or id string)
        const companyId = job.company?._id ? job.company._id.toString() : (job.company ? job.company.toString() : null);
        const createdById = job.createdBy?._id ? job.createdBy._id.toString() : (job.createdBy ? job.createdBy.toString() : null);
        const userIdStr = user?._id ? user._id.toString() : (user?.id ? user.id.toString() : null);

        if (!userIdStr || (companyId !== userIdStr && createdById !== userIdStr)) {
          toast.error('You can only edit your own jobs');
          navigate('/dashboard');
          return;
        }

        // Format the data for the form
        const formattedData = {
          title: job.title || '',
          description: job.description || '',
          category: job.category || '',
          jobType: job.jobType || 'full-time',
          employmentLevel: job.employmentLevel || 'mid',
          location: job.location || '',
          remotePolicy: job.remotePolicy || 'on-site',
          salary: {
            min: job.salary?.min?.toString() || '',
            max: job.salary?.max?.toString() || '',
            currency: job.salary?.currency || 'USD',
            period: job.salary?.period || 'yearly'
          },
          requirements: {
            experience: {
              min: job.requirements?.experience?.min?.toString() || '',
              max: job.requirements?.experience?.max?.toString() || ''
            },
            skills: job.requirements?.skills?.map(skill =>
              typeof skill === 'string' ? skill : skill.name
            ) || [''],
            education: job.requirements?.education || [''],
            certifications: job.requirements?.certifications || [''],
            languages: job.requirements?.languages || ['']
          },
          benefits: job.benefits || [''],
          applicationProcess: {
            questions: (() => {
              let qs = job.applicationProcess?.questions;
              // Normalize to an array of strings in all cases
              if (!Array.isArray(qs)) {
                if (!qs) qs = [];
                else if (typeof qs === 'string') qs = [qs];
                else if (typeof qs === 'object' && qs.question) qs = [qs.question];
                else qs = [];
              }
              return qs.map(q => (typeof q === 'string' ? q : (q.question || ''))).filter(Boolean);
            })(),
            requiresCoverLetter: job.applicationProcess?.requiresCoverLetter || false,
            requiresResume: job.applicationProcess?.requiresResume !== false
          },
          deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
          tags: job.tags || ['']
        };

        setJobData(formattedData);
      }
      } catch (error) {
        console.error('Error fetching job:', error);
        const status = error.response?.status;
        const serverMessage = error.response?.data?.message || error.response?.data || error.message;

        if (status === 404) {
          toast.error('Job not found');
        } else if (status === 401) {
          toast.error('Please sign in to continue');
          navigate('/login');
          setFetching(false);
          return;
        } else if (status === 403) {
          toast.error(error.response?.data?.message || 'Access denied');
        } else {
          // Generic message with detail for easier debugging
          toast.error(`Failed to load job details${serverMessage ? `: ${serverMessage}` : ''}`);
        }

        navigate('/dashboard');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!jobData.title || !jobData.description || !jobData.category || !jobData.jobType || !jobData.location) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate description length
      if (jobData.description.length < 50) {
        toast.error('Description must be at least 50 characters');
        setLoading(false);
        return;
      }

      // Format the jobData correctly for backend
      const formattedJobData = {
        title: jobData.title.trim(),
        description: jobData.description.trim(),
        category: jobData.category,
        jobType: jobData.jobType,
        employmentLevel: jobData.employmentLevel,
        location: jobData.location.trim(),
        remotePolicy: jobData.remotePolicy,
        salary: {
          min: jobData.salary.min ? parseInt(jobData.salary.min) : undefined,
          max: jobData.salary.max ? parseInt(jobData.salary.max) : undefined,
          currency: jobData.salary.currency,
          period: jobData.salary.period
        },
        requirements: {
          experience: {
            min: jobData.requirements.experience.min ? parseInt(jobData.requirements.experience.min) : undefined,
            max: jobData.requirements.experience.max ? parseInt(jobData.requirements.experience.max) : undefined
          },
          skills: jobData.requirements.skills
            .filter(skill => skill.trim() !== '')
            .map(skill => ({ name: skill.trim().toLowerCase(), level: 'intermediate' })),
          education: jobData.requirements.education
            .filter(edu => edu.trim() !== '')
            .map(edu => edu.trim()),
          certifications: jobData.requirements.certifications
            .filter(cert => cert.trim() !== '')
            .map(cert => cert.trim()),
          languages: jobData.requirements.languages
            .filter(lang => lang.trim() !== '')
            .map(lang => lang.trim())
        },
        benefits: jobData.benefits
          .filter(benefit => benefit.trim() !== '')
          .map(benefit => benefit.trim()),
        applicationProcess: {
          questions: jobData.applicationProcess.questions
            .filter(question => question.trim() !== '')
            .map(question => ({
              question: question.trim(),
              type: 'text',
              required: false
            })),
          requiresCoverLetter: jobData.applicationProcess.requiresCoverLetter,
          requiresResume: jobData.applicationProcess.requiresResume
        },
        tags: jobData.tags
          .filter(tag => tag.trim() !== '')
          .map(tag => tag.trim()),
        deadline: jobData.deadline || undefined
      };

      // Clean up undefined values
      const cleanObject = (obj) => {
        Object.keys(obj).forEach(key => {
          if (obj[key] === undefined || obj[key] === null) {
            delete obj[key];
          } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            cleanObject(obj[key]);
            if (Object.keys(obj[key]).length === 0) {
              delete obj[key];
            }
          } else if (Array.isArray(obj[key]) && obj[key].length === 0) {
            delete obj[key];
          }
        });
        return obj;
      };

      const cleanedJobData = cleanObject(formattedJobData);

      console.log('Updating job data:', cleanedJobData);

      // Make the update API call
      const response = await api.put(`/jobs/${id}`, cleanedJobData);

      if (response.data.success) {
        toast.success('Job updated successfully!');
        navigate('/dashboard');
      } else {
        throw new Error(response.data.message || 'Failed to update job');
      }
    } catch (error) {
      console.error('Job update error:', error);

      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check your connection.');
      } else if (error.response?.status === 401) {
        toast.error('Please log in again');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You can only edit your own jobs');
      } else if (error.response?.status === 404) {
        toast.error('Job not found');
        navigate('/dashboard');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update job. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for dynamic arrays
  const addField = (category, field) => {
    setJobData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: [...prev[category][field], (category === 'requirements' && field === 'skills') ? { name: '', level: 'intermediate' } : '']
      }
    }));
  };

  const removeField = (category, field, index) => {
    setJobData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: prev[category][field].filter((_, i) => i !== index)
      }
    }));
  };

  const updateField = (category, field, index, value) => {
    // Handle direct array fields (benefits, tags)
    if (category === field && Array.isArray(jobData[category])) {
      const newArray = [...jobData[category]];
      newArray[index] = value;
      setJobData(prev => ({
        ...prev,
        [category]: newArray
      }));
      return;
    }

    // Handle nested object fields (requirements.skills, etc.)
    const newArray = [...jobData[category][field]];

    if (category === 'requirements' && field === 'skills') {
      const existing = newArray[index];
      if (typeof existing === 'object' && existing !== null) {
        newArray[index] = { ...existing, name: value };
      } else {
        newArray[index] = { name: value, level: 'intermediate' };
      }
    } else {
      newArray[index] = value;
    }

    setJobData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: newArray
      }
    }));
  };

  // Add character count for description
  const descriptionLength = jobData.description.length;
  const isDescriptionValid = descriptionLength >= 50;

  // Render dynamic field section
  const renderDynamicFields = (title, fields, category, fieldName, placeholder, icon) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const inputValue = (field && typeof field === 'object') ? (field.name || '') : field;
          return (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => updateField(category, fieldName, index, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={placeholder}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(category, fieldName, index)}
                  className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => addField(category, fieldName)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another {title.slice(0, -1)}</span>
        </button>
      </div>
    </div>
  );

  // Show loading while checking auth or fetching job
  if (!mounted || fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!isEmployer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Employer Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You need an employer account to edit jobs.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Job
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Update the job details below
          </p>
        </div>

        {/* Job Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={jobData.title}
                  onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={jobData.category}
                  onChange={(e) => setJobData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Category</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="design">Design</option>
                  <option value="engineering">Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Type *
                </label>
                <select
                  required
                  value={jobData.jobType}
                  onChange={(e) => setJobData(prev => ({ ...prev, jobType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employment Level
                </label>
                <select
                  value={jobData.employmentLevel}
                  onChange={(e) => setJobData(prev => ({ ...prev, employmentLevel: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={jobData.location}
                  onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. New York, NY or Remote"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Remote Policy
                </label>
                <select
                  value={jobData.remotePolicy}
                  onChange={(e) => setJobData(prev => ({ ...prev, remotePolicy: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="on-site">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={jobData.deadline}
                  onChange={(e) => setJobData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Salary Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Salary ($)
                </label>
                <input
                  type="number"
                  value={jobData.salary.min}
                  onChange={(e) => setJobData(prev => ({
                    ...prev,
                    salary: { ...prev.salary, min: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="50000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Salary ($)
                </label>
                <input
                  type="number"
                  value={jobData.salary.max}
                  onChange={(e) => setJobData(prev => ({
                    ...prev,
                    salary: { ...prev.salary, max: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="90000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salary Period
                </label>
                <select
                  value={jobData.salary.period}
                  onChange={(e) => setJobData(prev => ({
                    ...prev,
                    salary: { ...prev.salary, period: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="yearly">Per Year</option>
                  <option value="monthly">Per Month</option>
                  <option value="hourly">Per Hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* Experience Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Experience Requirements
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Experience (years)
                </label>
                <input
                  type="number"
                  value={jobData.requirements.experience.min}
                  onChange={(e) => setJobData(prev => ({
                    ...prev,
                    requirements: {
                      ...prev.requirements,
                      experience: { ...prev.requirements.experience, min: e.target.value }
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="2"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Experience (years)
                </label>
                <input
                  type="number"
                  value={jobData.requirements.experience.max}
                  onChange={(e) => setJobData(prev => ({
                    ...prev,
                    requirements: {
                      ...prev.requirements,
                      experience: { ...prev.requirements.experience, max: e.target.value }
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          {renderDynamicFields(
            "Required Skills",
            jobData.requirements.skills,
            "requirements",
            "skills",
            "e.g. React, JavaScript, etc.",
            <Briefcase className="w-5 h-5" />
          )}

          {/* Education */}
          {renderDynamicFields(
            "Education Requirements",
            jobData.requirements.education,
            "requirements",
            "education",
            "e.g. Bachelor's in Computer Science",
            <GraduationCap className="w-5 h-5" />
          )}

          {/* Certifications */}
          {renderDynamicFields(
            "Certifications",
            jobData.requirements.certifications,
            "requirements",
            "certifications",
            "e.g. AWS Certified, PMP, etc.",
            <Building className="w-5 h-5" />
          )}

          {/* Languages */}
          {renderDynamicFields(
            "Language Requirements",
            jobData.requirements.languages,
            "requirements",
            "languages",
            "e.g. English, Spanish, etc.",
            <Plus className="w-5 h-5" />
          )}

          {/* Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Benefits
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              List the benefits and perks your company offers. This helps attract candidates by showing what they can expect.
            </p>
            <div className="space-y-4">
              {jobData.benefits.map((benefit, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateField("benefits", "benefits", index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. Health insurance, Remote work, etc."
                  />
                  {jobData.benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("benefits", "benefits", index)}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField("benefits", "benefits")}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Benefit</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Tags
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Add relevant tags to help candidates find your job. Use keywords like "remote", "startup", "tech", "senior", etc.
            </p>
            <div className="space-y-4">
              {jobData.tags.map((tag, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateField("tags", "tags", index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. remote, startup, tech, etc."
                  />
                  {jobData.tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("tags", "tags", index)}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField("tags", "tags")}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Tag</span>
              </button>
            </div>
          </div>

          {/* Application Questions */}
          {renderDynamicFields(
            "Application Questions",
            jobData.applicationProcess.questions,
            "applicationProcess",
            "questions",
            "e.g. Why do you want to work with us?",
            <Plus className="w-5 h-5" />
          )}

          {/* Cover Letter Requirement */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Require Cover Letter
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Candidates will be required to submit a cover letter
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={jobData.applicationProcess.requiresCoverLetter}
                  onChange={(e) => setJobData(prev => ({
                    ...prev,
                    applicationProcess: {
                      ...prev.applicationProcess,
                      requiresCoverLetter: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Job Description *
            </h2>

            <textarea
              required
              value={jobData.description}
              onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Describe the role, responsibilities, and what you're looking for in a candidate (minimum 50 characters)..."
            />
            <div className={`mt-2 text-sm ${isDescriptionValid ? 'text-green-600' : 'text-red-600'}`}>
              {descriptionLength}/50 characters {isDescriptionValid ? '✓' : '(minimum 50 required)'}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isDescriptionValid}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Job...</span>
                </div>
              ) : (
                'Update Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;