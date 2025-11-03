import React from 'react';
import { User, Building } from 'lucide-react';

const RoleSelection = ({ onRoleSelect, selectedRole }) => {
  const roles = [
    {
      id: 'job_seeker',
      title: 'Job Seeker',
      description: 'Find your dream job and advance your career',
      icon: User,
      color: 'blue'
    },
    {
      id: 'employer',
      title: 'Employer',
      description: 'Post jobs and find the perfect candidates',
      icon: Building,
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Role
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select how you'll be using our platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`p-6 border-2 rounded-xl transition-all duration-200 text-left hover:shadow-lg ${
                isSelected
                  ? `border-${role.color}-500 bg-${role.color}-50 dark:bg-${role.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  isSelected
                    ? `bg-${role.color}-500 text-white`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg mb-1 ${
                    isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {role.title}
                  </h3>
                  <p className={`text-sm ${
                    isSelected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelection;