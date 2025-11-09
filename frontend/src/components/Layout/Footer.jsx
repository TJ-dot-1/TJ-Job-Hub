import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Instagram, Twitter, Facebook, Linkedin, Send, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const Footer = () => {
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/tjjobportal', color: 'hover:text-pink-400' },
    { icon: Twitter, href: 'https://twitter.com/tjjobportal', color: 'hover:text-blue-400' },
    { icon: Facebook, href: 'https://facebook.com/tjjobportal', color: 'hover:text-blue-600' },
    { icon: Linkedin, href: 'https://linkedin.com/company/tjjobportal', color: 'hover:text-blue-500' }
  ];

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/feedback', feedbackForm);

      if (response.data.success) {
        toast.success(response.data.message);
        setFeedbackForm({
          name: '',
          email: '',
          message: '',
          category: 'general'
        });
        setShowFeedbackForm(false);
      } else {
        toast.error(response.data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/ted.jpg"
                alt="TJ Jobs Logo"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <span className="text-xl font-bold">TJ Job Portal</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Empowering decent work through digital innovation. Connecting talent with opportunities worldwide.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 transition-colors ${social.color}`}
                    aria-label={`Follow us on ${social.icon.name}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/jobs" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Browse Jobs</Link></li>
              <li><Link to="/companies" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Companies</Link></li>
              <li><Link to="/assessments" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Skill Assessments</Link></li>
              <li><Link to="/career-advice" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Career Advice</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/post-job" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Post a Job</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Pricing</Link></li>
              <li><Link to="/recruit" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Recruit</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Employer Dashboard</Link></li>
            </ul>
          </div>

          {/* Company & Feedback */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Terms of Service</Link></li>
            </ul>

            {/* Feedback Button */}
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="mt-4 flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Share Your Thoughts</span>
            </button>
          </div>
        </div>

        {/* Feedback Form */}
        {showFeedbackForm && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Share Your Thoughts
            </h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={feedbackForm.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="ui">UI/UX Feedback</option>
                  <option value="performance">Performance Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us what you think..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col justify-center items-center text-center">
          <p className="text-gray-400 text-sm">
            © 2025 TJ Job Hub. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-gray-400 text-sm">Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-gray-400 text-sm">for a better world</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
