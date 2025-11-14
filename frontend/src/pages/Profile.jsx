import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Edit3,
  Save,
  X,
  Camera,
  Upload,
  Download,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: ''
  });

  // Fetch user profile data from database
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    title: 'Job Seeker',
    bio: '',
    avatar: '',
    cover: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    resume: '',
    skills: [],
    experience: [],
    education: [],
    certifications: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.success) {
          const profile = response.data.profile;
          setUserData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.profile?.phone || '',
            location: profile.profile?.location || '',
            title: profile.profile?.headline || 'Job Seeker',
            bio: profile.profile?.bio || '',
            avatar: profile.profile?.avatar || '',
            cover: profile.profile?.coverPhoto || '',
            website: profile.profile?.website || '',
            linkedin: profile.profile?.socialLinks?.linkedin || '',
            github: profile.profile?.socialLinks?.github || '',
            twitter: profile.profile?.socialLinks?.twitter || '',
            resume: profile.profile?.resume || '',
            skills: profile.profile?.skills || [],
            experience: profile.profile?.experience || [],
            education: profile.profile?.education || [],
            certifications: profile.profile?.certifications || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        location: userData.location,
        title: userData.title,
        bio: userData.bio,
        website: userData.website,
        linkedin: userData.linkedin,
        github: userData.github,
        twitter: userData.twitter
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelEdit = () => {
    setFormData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      location: userData.location,
      title: userData.title,
      bio: userData.bio,
      website: userData.website,
      linkedin: userData.linkedin,
      github: userData.github,
      twitter: userData.twitter
    });
    setIsEditing(false);
  };

  // Update the handleSaveProfile function
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/profile', formData);
      if (response.data.success) {
        const updatedProfile = response.data.profile;
        const updatedUserData = {
          name: updatedProfile.name,
          email: updatedProfile.email,
          phone: updatedProfile.profile?.phone || '',
          location: updatedProfile.profile?.location || '',
          title: updatedProfile.profile?.headline || 'Job Seeker',
          bio: updatedProfile.profile?.bio || '',
          avatar: updatedProfile.profile?.avatar || '',
          cover: updatedProfile.profile?.coverPhoto || '',
          website: updatedProfile.profile?.website || '',
          linkedin: updatedProfile.profile?.socialLinks?.linkedin || '',
          github: updatedProfile.profile?.socialLinks?.github || '',
          twitter: updatedProfile.profile?.socialLinks?.twitter || '',
          resume: updatedProfile.profile?.resume || '',
          skills: updatedProfile.profile?.skills || [],
          experience: updatedProfile.profile?.experience || [],
          education: updatedProfile.profile?.education || [],
          certifications: updatedProfile.profile?.certifications || []
        };
        setUserData(updatedUserData);

        if (updateUser) {
          updateUser({ ...user, ...updatedUserData });
        }
      }

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

// Update resume upload
const handleResumeUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('resume', file);

  try {
    const response = await api.post('/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setUserData(prev => ({
      ...prev,
      resume: response.data.resume,
      resumePreview: response.data.resumePreview
    }));
    toast.success('Resume uploaded successfully!');
  } catch (error) {
    console.error('Resume upload error:', error);
    toast.error('Failed to upload resume');
  }
};

// Handle avatar upload
const handleAvatarUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setUserData(prev => ({
      ...prev,
      avatar: response.data.avatar
    }));
    toast.success('Avatar uploaded successfully!');
  } catch (error) {
    console.error('Avatar upload error:', error);
    toast.error('Failed to upload avatar');
  }
};

// User data is now handled by AuthContext, no need for separate fetch

const handleAddExperience = async (experienceData) => {
  try {
    const response = await api.post('/profile/experience', experienceData);
    setUserData(prev => ({ ...prev, experience: response.data }));
    toast.success('Experience added successfully!');
  } catch (error) {
    console.error('Add experience error:', error);
    toast.error('Failed to add experience');
  }
};

const handleAddEducation = async (educationData) => {
  try {
    const response = await api.post('/profile/education', educationData);
    setUserData(prev => ({ ...prev, education: response.data }));
    toast.success('Education added successfully!');
  } catch (error) {
    console.error('Add education error:', error);
    toast.error('Failed to add education');
  }
};

const handleAddSkill = async (skill) => {
  try {
    const response = await api.post('/profile/skills', { skill });
    setUserData(prev => ({ ...prev, skills: response.data }));
    toast.success('Skill added successfully!');
  } catch (error) {
    console.error('Add skill error:', error);
    toast.error('Failed to add skill');
  }
};

const AddExperienceModal = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setIsOpen(false);
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
      >
        + Add Experience
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Experience</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  disabled={formData.current}
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.current}
                  onChange={(e) => setFormData(prev => ({ ...prev, current: e.target.checked }))}
                  className="mr-2"
                />
                Currently working here
              </label>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                rows="3"
              />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Add</button>
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const AddEducationModal = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setIsOpen(false);
    setFormData({
      degree: '',
      institution: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
      >
        + Add Education
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Education</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Degree"
                value={formData.degree}
                onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Institution"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Field of Study"
                value={formData.field}
                onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  disabled={formData.current}
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.current}
                  onChange={(e) => setFormData(prev => ({ ...prev, current: e.target.checked }))}
                  className="mr-2"
                />
                Currently studying here
              </label>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                rows="3"
              />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg">Add</button>
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const AddSkillModal = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [skill, setSkill] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skill.trim()) {
      await onAdd(skill.trim());
      setSkill('');
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        + Add Skill
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Skill</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter skill name"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Add</button>
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const ThemeToggle = () => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

const SocialLink = ({ href, icon: Icon, label }) => {
  if (!href) return null;

  // Use the Icon component to avoid eslint error
  const IconComponent = Icon;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <IconComponent className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </a>
  );
};

  const ProfileSection = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your personal information and account settings
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'experience', label: 'Experience', icon: Briefcase },
                  { id: 'education', label: 'Education', icon: GraduationCap },
                  { id: 'skills', label: 'Skills', icon: Award },
                  { id: 'settings', label: 'Settings', icon: Shield },
                  { id: 'resume', label: 'Resume', icon: Download }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Cover Photo */}
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    <button className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                      <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Profile Info */}
                  <div className="px-6 pb-6 -mt-12">
                    <div className="flex items-end justify-between">
                      <div className="flex items-end space-x-4">
                        <div className="relative">
                          {userData.avatar ? (
                            <img
                              src={userData.avatar}
                              alt="Profile"
                              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center text-white text-2xl font-bold">
                              {userData.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <label className="cursor-pointer">
                              <Camera className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                              />
                            </label>
                          </button>
                        </div>
                        
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditing ? (
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                              />
                            ) : (
                              userData.name
                            )}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400">
                            {isEditing ? (
                              <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none w-full"
                              />
                            ) : (
                              userData.title
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveProfile}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Profile</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <ProfileSection title="Contact Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white">{userData.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white">{userData.phone || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="City, Country"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white">{userData.location || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </ProfileSection>

                {/* Bio */}
                <ProfileSection title="About Me">
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {userData.bio}
                    </p>
                  )}
                </ProfileSection>

                {/* Social Links */}
                <ProfileSection title="Social Links">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Website</label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="https://example.com"
                          />
                        ) : (
                          <SocialLink href={userData.website} icon={Globe} label="Website" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Linkedin className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">LinkedIn</label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="https://linkedin.com/in/username"
                          />
                        ) : (
                          <SocialLink href={userData.linkedin} icon={Linkedin} label="LinkedIn" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Github className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">GitHub</label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="github"
                            value={formData.github}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="https://github.com/username"
                          />
                        ) : (
                          <SocialLink href={userData.github} icon={Github} label="GitHub" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Twitter className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Twitter</label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="https://twitter.com/username"
                          />
                        ) : (
                          <SocialLink href={userData.twitter} icon={Twitter} label="Twitter" />
                        )}
                      </div>
                    </div>
                  </div>
                </ProfileSection>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                <ProfileSection title="Work Experience">
                  <div className="space-y-4">
                    {(userData.experience || []).map((exp, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{exp.title}</h4>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {exp.startDate && new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : exp.endDate && new Date(exp.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                    <AddExperienceModal onAdd={handleAddExperience} />
                  </div>
                </ProfileSection>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-6">
                <ProfileSection title="Education">
                  <div className="space-y-4">
                    {(userData.education || []).map((edu, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                          <p className="text-green-600 dark:text-green-400 font-medium">{edu.institution}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {edu.startDate && new Date(edu.startDate).toLocaleDateString()} - {edu.current ? 'Present' : edu.endDate && new Date(edu.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <AddEducationModal onAdd={handleAddEducation} />
                  </div>
                </ProfileSection>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <ProfileSection title="Skills & Certifications">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(userData.skills || []).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                          {skill.name || skill}
                        </span>
                      ))}
                      <AddSkillModal onAdd={handleAddSkill} />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Certifications</h4>
                    <div className="space-y-3">
                      {userData.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">{cert.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer} • {cert.date}</p>
                          </div>
                          <Award className="w-5 h-5 text-yellow-500" />
                        </div>
                      ))}
                      <button className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-yellow-500 dark:hover:border-yellow-400 transition-colors text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                        + Add Certification
                      </button>
                    </div>
                  </div>
                </ProfileSection>
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="space-y-6">
                <ProfileSection title="Resume">
                  <div className="text-center py-8">
                    {userData.resumePreview && !userData.resume?.toLowerCase().endsWith('.pdf') && (
                      <div className="mb-6">
                        <img
                          src={userData.resumePreview}
                          alt="Resume Preview"
                          className="max-w-full h-auto max-h-96 mx-auto border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Resume Preview
                        </p>
                      </div>
                    )}
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {userData.resume ? 'Resume Uploaded' : 'No Resume'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {userData.resume ? 'Last updated recently' : 'Upload your resume to get started'}
                    </p>
                    <div className="flex justify-center space-x-3">
                      {userData.resume && (
                        <a
                          href={userData.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Resume</span>
                        </a>
                      )}
                      <label className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                        <span className="flex items-center space-x-2">
                          <Upload className="w-4 h-4" />
                          <span>{userData.resume ? 'Upload New' : 'Upload Resume'}</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </ProfileSection>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <ProfileSection title="Account Settings">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about your applications</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Bell className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Privacy Settings</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage your profile visibility</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Shield className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Subscription</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Free Plan • Upgrade to Premium</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CreditCard className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Theme</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark mode</p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>
                </ProfileSection>

                <ProfileSection title="Danger Zone">
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">Delete Account</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </ProfileSection>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Profile;