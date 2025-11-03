import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Lock, AlertTriangle } from 'lucide-react';

const SubscriptionStatus = () => {
  const { user, isPro, monthlyUsage } = useAuth();

  if (!user || isPro) return null;

  const getLimits = () => {
    if (user.role === 'job_seeker') {
      return {
        applications: { used: monthlyUsage?.applications || 0, limit: 5 },
        adviceViews: { used: monthlyUsage?.adviceViews || 0, limit: 2 }
      };
    } else if (user.role === 'employer') {
      return {
        jobPostings: { used: monthlyUsage?.jobPostings || 0, limit: 3 }
      };
    }
    return {};
  };

  const limits = getLimits();

  const hasReachedLimit = Object.values(limits).some(limit => limit.used >= limit.limit);

  return (
    <div className={`border rounded-lg p-4 mb-6 ${hasReachedLimit ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3">
          {hasReachedLimit ? (
            <Lock className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h3 className={`text-sm font-medium ${hasReachedLimit ? 'text-red-800' : 'text-yellow-800'}`}>
              {hasReachedLimit ? 'Subscription Limit Reached' : 'Free Plan Limits'}
            </h3>
            <div className="mt-2 space-y-1">
              {limits.applications && (
                <p className={`text-sm ${hasReachedLimit ? 'text-red-700' : 'text-yellow-700'}`}>
                  Job Applications: {limits.applications.used}/{limits.applications.limit}
                  {limits.applications.used >= limits.applications.limit && (
                    <span className="text-red-600 font-medium ml-1">(Limit reached)</span>
                  )}
                </p>
              )}
              {limits.adviceViews && (
                <p className={`text-sm ${hasReachedLimit ? 'text-red-700' : 'text-yellow-700'}`}>
                  Career Advice Views: {limits.adviceViews.used}/{limits.adviceViews.limit}
                  {limits.adviceViews.used >= limits.adviceViews.limit && (
                    <span className="text-red-600 font-medium ml-1">(Limit reached)</span>
                  )}
                </p>
              )}
              {limits.jobPostings && (
                <p className={`text-sm ${hasReachedLimit ? 'text-red-700' : 'text-yellow-700'}`}>
                  Job Postings: {limits.jobPostings.used}/{limits.jobPostings.limit}
                  {limits.jobPostings.used >= limits.jobPostings.limit && (
                    <span className="text-red-600 font-medium ml-1">(Limit reached)</span>
                  )}
                </p>
              )}
            </div>
            {hasReachedLimit && (
              <p className="text-xs text-red-600 mt-2">
                Some features are disabled until you upgrade.
              </p>
            )}
          </div>
        </div>
        <Link
          to="/pricing"
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            hasReachedLimit
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionStatus;