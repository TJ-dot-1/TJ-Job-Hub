// components/CompleteProfile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building, User, Check, Loader } from 'lucide-react';

const CompleteProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [companyData, setCompanyData] = useState({});
  const [loading, setLoading] = useState(false);

  // Load pending data from localStorage
  useEffect(() => {
    const pendingRole = localStorage.getItem('pendingRole');
    const pendingCompanyData = localStorage.getItem('pendingCompanyData');
    
    if (pendingRole) {
      setSelectedRole(pendingRole);
    }
    
    if (pendingCompanyData) {
      setCompanyData(JSON.parse(pendingCompanyData));
    }
  }, []);

  const handleCompleteProfile = async () => {
    if (!selectedRole) return;

    setLoading(true);

    try {
      // Update user role and company data via API
      const updatedUser = {
        ...user,
        role: selectedRole,
        ...(selectedRole === 'employer' && companyData.name && { company: companyData })
      };

      // Update user in context
      updateUser(updatedUser);

      // Clear temporary storage
      localStorage.removeItem('pendingRole');
      localStorage.removeItem('pendingCompanyData');

      // Redirect based on role
      const targetPath = selectedRole === 'employer' ? '/dashboard' : '/jobs';
      navigate(targetPath);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Store in localStorage in case user refreshes
    localStorage.setItem('pendingRole', role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome, {user?.name || user?.email}! Please confirm your account type.
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Type
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleRoleSelect('job_seeker')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedRole === 'job_seeker'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Job Seeker</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Looking for jobs</div>
                  </div>
                </div>
                {selectedRole === 'job_seeker' && <Check className="w-5 h-5 text-blue-500" />}
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('employer')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedRole === 'employer'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Employer</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Hiring talent</div>
                  </div>
                </div>
                {selectedRole === 'employer' && <Check className="w-5 h-5 text-green-500" />}
              </div>
            </button>
          </div>
        </div>

        {/* Company Info Review (for employers) */}
        {selectedRole === 'employer' && companyData.name && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Company Information</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {companyData.name}</div>
              {companyData.industry && <div><span className="font-medium">Industry:</span> {companyData.industry}</div>}
              {companyData.size && <div><span className="font-medium">Size:</span> {companyData.size}</div>}
            </div>
          </div>
        )}

        {/* Complete Button */}
        <button
          onClick={handleCompleteProfile}
          disabled={!selectedRole || loading}
          className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Setting up your account...
            </>
          ) : (
            'Complete Setup'
          )}
        </button>
      </div>
    </div>
  );
};

export default CompleteProfile;