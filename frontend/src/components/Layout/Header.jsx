import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, User, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfileImageUrl } from '../../utils/imageKit';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/ted.jpg"
              alt="Jobs Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
            />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6 xl:space-x-8">
            <Link to="/jobs" className="text-gray-600 hover:text-blue-600 transition-colors text-sm lg:text-base" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Find Jobs
            </Link>
            <Link to="/companies" className="text-gray-600 hover:text-blue-600 transition-colors text-sm lg:text-base" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Companies
            </Link>
            <Link to="/cv-revamp" className="text-gray-600 hover:text-blue-600 transition-colors text-sm lg:text-base" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              CV Revamp
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/betting" className="text-gray-600 hover:text-blue-600 transition-colors text-sm lg:text-base" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  🎮 Betting
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors text-sm lg:text-base" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {user?.profile?.avatar ? (
                      <img
                        src={getProfileImageUrl(user.profile.avatar)}
                        alt={user?.name || 'Profile'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : user?.name ? (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                        {user.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 transition-colors text-sm lg:text-base"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm lg:text-base"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-6">
            <nav className="flex flex-col space-y-6">
              <Link
                to="/jobs"
                className="text-gray-600 hover:text-blue-600 transition-colors text-base"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Find Jobs
              </Link>
              <Link
                to="/companies"
                className="text-gray-600 hover:text-blue-600 transition-colors text-base"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Companies
              </Link>
              <Link
                to="/cv-revamp"
                className="text-gray-600 hover:text-blue-600 transition-colors text-base"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                CV Revamp
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/betting"
                    className="text-gray-600 hover:text-blue-600 transition-colors text-base"
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    🎮 Betting
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-blue-600 transition-colors text-base"
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </nav>
            <div className="flex flex-col space-y-4 mt-6 pt-4 border-t">
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user?.profile?.avatar ? (
                      <img
                        src={getProfileImageUrl(user.profile.avatar)}
                        alt={user?.name || 'Profile'}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : user?.name ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                        {user.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-600 hover:text-red-600 transition-colors text-base"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-600 transition-colors text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-base text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;