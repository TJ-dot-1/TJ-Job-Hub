import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileForm from '../../components/profile/ProfileForm';
import FileUpload from '../../components/profile/FileUpload';
import api from '../../utils/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile');
      if (response.data.success) {
        setUser(response.data.profile);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUser(prev => ({
      ...prev,
      ...updatedProfile
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your profile information and manage your preferences
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
          {/* Avatar and Resume Section */}
          <div className="sm:col-span-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
              <div className="mt-2">
                <FileUpload
                  type="avatar"
                  currentFile={user?.profile?.avatar}
                  onSuccess={(data) => handleProfileUpdate({ profile: { ...user.profile, avatar: data.avatar } })}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Resume</h3>
              <div className="mt-2">
                <FileUpload
                  type="resume"
                  currentFile={user?.profile?.resumePreview}
                  onSuccess={(data) => handleProfileUpdate({
                    profile: {
                      ...user.profile,
                      resume: data?.resume,
                      resumePreview: data?.resumePreview
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Profile Form Section */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <ProfileForm onSuccess={handleProfileUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;