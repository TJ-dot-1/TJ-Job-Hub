import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const ProfileForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    location: '',
    bio: '',
    skills: [],
    preferredJobTypes: [],
    availability: 'immediately',
    salaryExpectation: { min: 0, max: 0, currency: 'USD' }
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        title: user.profile?.headline || '',
        location: user.profile?.location || '',
        bio: user.profile?.bio || '',
        skills: user.profile?.skills || [],
        preferredJobTypes: user.profile?.preferredJobTypes || [],
        availability: user.profile?.availability || 'immediately',
        salaryExpectation: user.profile?.salaryExpectation || { min: 0, max: 0, currency: 'USD' }
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.put('/profile', formData);
      if (response.data.success) {
        onSuccess?.(response.data.profile);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: skill, level: 'intermediate' }]
    }));
  };

  const handleSkillRemove = (skillName) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Professional Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Senior Software Engineer"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="e.g. San Francisco, CA"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Skills</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.skills.map((skill) => (
            <span
              key={skill.name}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => handleSkillRemove(skill.name)}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add a skill"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (e.target.value) {
                handleSkillAdd(e.target.value);
                e.target.value = '';
              }
            }
          }}
          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Job Types</label>
        <div className="mt-2 space-y-2">
          {['Full-time', 'Part-time', 'Contract', 'Remote'].map((type) => (
            <label key={type} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={formData.preferredJobTypes.includes(type)}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    preferredJobTypes: e.target.checked
                      ? [...prev.preferredJobTypes, type]
                      : prev.preferredJobTypes.filter(t => t !== type)
                  }));
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Salary Expectation</label>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div>
            <input
              type="number"
              value={formData.salaryExpectation.min}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                salaryExpectation: {
                  ...prev.salaryExpectation,
                  min: parseInt(e.target.value)
                }
              }))}
              placeholder="Min"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="number"
              value={formData.salaryExpectation.max}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                salaryExpectation: {
                  ...prev.salaryExpectation,
                  max: parseInt(e.target.value)
                }
              }))}
              placeholder="Max"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={formData.salaryExpectation.currency}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                salaryExpectation: {
                  ...prev.salaryExpectation,
                  currency: e.target.value
                }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;