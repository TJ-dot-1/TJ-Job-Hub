import React, { useState } from 'react';
import { FileText, Plus, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CvRevamp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobRole: '',
    industry: '',
    message: '',
    serviceType: 'revamp', // 'revamp' or 'new'
    package: 'basic', // 'basic', 'professional', 'executive'
  });
  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or DOC/DOCX file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.jobRole || !formData.package) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.serviceType === 'revamp' && !cvFile) {
      toast.error('Please upload your existing CV for revamp');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (cvFile) {
        submitData.append('cv', cvFile);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.post('/cv-revamp', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        setSubmitted(true);
        toast.success('CV request submitted successfully! Our team will contact you soon.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Request Submitted Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your CV revamp request has been sent successfully! Our team will contact you soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            CV Revamp & Creation Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Let our experts craft or polish your CV to help you stand out to employers.
          </p>
        </div>

        {/* Service Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Choose Your Service
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setFormData(prev => ({ ...prev, serviceType: 'revamp' }))}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                formData.serviceType === 'revamp'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <FileText className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                📝 Upload existing CV for revamp
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Improve your current CV with professional enhancements
              </p>
            </button>

            <button
              onClick={() => setFormData(prev => ({ ...prev, serviceType: 'new' }))}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                formData.serviceType === 'new'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <Plus className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                ✍️ Request a brand-new CV
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create a professional CV from scratch
              </p>
            </button>
          </div>
        </div>

        {/* Sample CV Templates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Sample CV Transformations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Before (Basic CV)</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium">John Doe</p>
                <p>Software Developer</p>
                <p className="mt-2">• Worked at ABC Company for 3 years</p>
                <p>• Good at coding</p>
                <p>• Bachelor's degree in Computer Science</p>
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">After (Professional)</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-gray-700 dark:text-gray-300">
                <p className="font-bold text-lg">John Doe</p>
                <p className="text-blue-600 font-medium">Senior Software Developer</p>
                <p className="mt-2">• Led development of scalable web applications serving 10K+ users at ABC Company (2019-Present)</p>
                <p>• Architected and implemented RESTful APIs using Node.js and Express, reducing response time by 40%</p>
                <p>• Bachelor of Science in Computer Science, GPA 3.8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Package Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Choose Your Package
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setFormData(prev => ({ ...prev, package: 'basic' }))}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                formData.package === 'basic'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📄</span>
                <span className="text-lg font-bold text-green-600">$5</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Basic Package
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Professional CV formatting, grammar check, and basic optimization
              </p>
            </button>

            <button
              onClick={() => setFormData(prev => ({ ...prev, package: 'professional' }))}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                formData.package === 'professional'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💼</span>
                <span className="text-lg font-bold text-green-600">$20</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Professional Package
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Complete CV rewrite, ATS optimization, and industry-specific tailoring
              </p>
            </button>

            <button
              onClick={() => setFormData(prev => ({ ...prev, package: 'executive' }))}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                formData.package === 'executive'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🏆</span>
                <span className="text-lg font-bold text-green-600">$50</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Executive Package
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Premium CV design, executive summary, and personalized consultation
              </p>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Role / Industry *
                </label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer, Marketing"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            {formData.serviceType === 'revamp' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload CV (PDF/DOC/DOCX) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                {cvFile && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Selected: {cvFile.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message/Instructions
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                placeholder="Any specific requirements or instructions for your CV..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span>Uploading... {uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CvRevamp;