import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Users, Award, Globe, Shield, Heart } from 'lucide-react';
import HeroSearch from '../components/home/HeroSearch';

const Home = () => {
  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "AI-Powered Job Matching",
      description: "Our advanced AI matches you with perfect job opportunities based on your skills and preferences."
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Verified Job Opportunities",
      description: "Access verified job listings from top companies worldwide."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Direct Company Connections",
      description: "Connect directly with employers and schedule interviews through our platform."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Skill Assessments",
      description: "Validate your skills with industry-recognized assessments and certifications."
    }
  ];

  const sdgFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "SDG 8 - Decent Work",
      description: "Promoting inclusive economic growth and decent work for all"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Gender Equality",
      description: "Equal opportunities and pay transparency for all genders"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Reduced Inequalities",
      description: "Bridging the opportunity gap across regions and backgrounds"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Find Your Dream Job with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                AI Power
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-200 max-w-3xl mx-auto px-4">
              Join thousands who found their perfect career match through our intelligent job portal.
              Empowering decent work and economic growth worldwide.
            </p>
            
            <HeroSearch />
            
            <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {sdgFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20"
                >
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg mb-2 sm:mb-3 mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-200">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Choose TJ Job Portal?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              We're revolutionizing the job search experience with cutting-edge technology
              and a commitment to sustainable development goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 sm:p-6">
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <div className="text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of job seekers and employers already using our platform.
          </p>
          <div className="flex flex-col gap-4 justify-center w-full max-w-md mx-auto">
            <Link
              to="/register"
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors text-center text-lg font-medium"
            >
              Get Started Free
            </Link>
            <Link
              to="/jobs"
              className="w-full bg-transparent border-2 border-white text-white px-6 py-4 rounded-lg hover:bg-white hover:text-gray-900 transition-colors text-center text-lg font-medium"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;