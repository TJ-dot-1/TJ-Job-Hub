import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Target, Zap, Shield, BarChart3, MessageSquare } from 'lucide-react';

const Recruit = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "AI-Powered Matching",
      description: "Our advanced algorithms match you with the most qualified candidates based on skills, experience, and culture fit."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast Hiring",
      description: "Reduce time-to-hire with our streamlined application process and automated candidate communications."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Guarantee",
      description: "Access pre-vetted candidates with verified skills and experience to ensure hiring success."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Make data-driven hiring decisions with detailed insights into candidate pipelines and hiring metrics."
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Direct Communication",
      description: "Chat directly with candidates, schedule interviews, and manage the entire hiring process in one platform."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Talent Pool",
      description: "Access our database of active and passive candidates actively looking for new opportunities."
    }
  ];

  const stats = [
    { number: "50%", label: "Faster Hiring" },
    { number: "85%", label: "Candidate Satisfaction" },
    { number: "3x", label: "More Qualified Candidates" },
    { number: "24/7", label: "Support" }
  ];

  const handleGetStarted = () => {
    navigate('/register'); // or '/login' depending on your auth flow
  };


  const handleContactSales = () => {
    // You can implement contact sales logic here
    // For now, just navigate to contact page or open email
    window.location.href = 'mailto:sales@tjjobportal.com';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Hire Better, 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"> Faster</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Find and hire top talent with our AI-powered recruitment platform. 
              Streamline your hiring process and build your dream team.
            </p>
            <div className="space-x-4">
              <button 
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Start Hiring Now
              </button>
              <button 
                onClick={handleContactSales}
                className="bg-transparent border border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-gray-900 transition-colors text-lg font-medium"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Recruit with Us?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform is designed to make hiring efficient, effective, and enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that have revolutionized their recruitment process with our platform.
          </p>
          <div className="space-x-4">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium"
            >
              Get Started Free
            </button>
            <button 
              onClick={handleContactSales}
              className="bg-transparent border border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-lg font-medium"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recruit;