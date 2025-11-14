import React from 'react';
import { BookOpen, Video, Users, TrendingUp, ArrowRight, Play, Clock } from 'lucide-react';
import SubscriptionStatus from '../components/SubscriptionStatus';

const CareerAdvice = () => {
  const articles = [
    {
      title: "How to Write a Resume That Gets Noticed",
      description: "Learn the key elements that make your resume stand out to recruiters and hiring managers.",
      category: "Resume Tips",
      readTime: "5 min read",
      featured: true,
      url: "https://www.themuse.com/advice/how-to-write-a-resume-that-gets-noticed"
    },
    {
      title: "Ace Your Next Technical Interview",
      description: "Prepare for technical interviews with these proven strategies and practice techniques.",
      category: "Interview Prep",
      readTime: "8 min read",
      featured: true,
      url: "https://www.freecodecamp.org/news/how-to-ace-your-technical-interview/"
    },
    {
      title: "Navigating Career Transitions Successfully",
      description: "Guide to making smooth career changes and transitioning between industries.",
      category: "Career Growth",
      readTime: "6 min read",
      featured: false,
      url: "https://hbr.org/2020/05/how-to-make-a-successful-career-transition"
    },
    {
      title: "Remote Work Best Practices",
      description: "Maximize your productivity and maintain work-life balance while working remotely.",
      category: "Remote Work",
      readTime: "4 min read",
      featured: false,
      url: "https://www.nytimes.com/guides/business/remote-work"
    },
    {
      title: "Salary Negotiation Strategies",
      description: "Get the compensation you deserve with these effective negotiation techniques.",
      category: "Compensation",
      readTime: "7 min read",
      featured: false,
      url: "https://www.forbes.com/sites/forbescoachescouncil/2021/04/13/how-to-negotiate-your-salary-like-a-pro/"
    },
    {
      title: "Building Your Personal Brand",
      description: "Create a strong personal brand that attracts opportunities and advances your career.",
      category: "Personal Growth",
      readTime: "5 min read",
      featured: false,
      url: "https://www.linkedin.com/business/talent/blog/talent-acquisition/personal-branding-tips"
    }
  ];

  const videos = [
    {
      title: "How to Ace Your Next Job Interview",
      description: "Expert tips from hiring managers on what they look for in candidates.",
      youtubeId: "DHDrj0_bMQ0",
      duration: "5:34",
      views: "2.5M",
      category: "Interview Prep"
    },
    {
      title: "Resume Writing Tips That Actually Work",
      description: "Learn how to create a resume that gets you noticed by recruiters.",
      youtubeId: "TtuK2aU0mBQ",
      duration: "15:22",
      views: "89K",
      category: "Resume Tips"
    },
    {
      title: "Career Transition Success Stories",
      description: "Real stories from professionals who successfully changed careers.",
      youtubeId: "3Z8oW5g8KjM",
      duration: "18:45",
      views: "67K",
      category: "Career Growth"
    },
    {
      title: "Networking for Introverts",
      description: "Build meaningful professional connections even if you're not outgoing.",
      youtubeId: "7X5tP3x7QwA",
      duration: "10:18",
      views: "43K",
      category: "Networking"
    },
    {
      title: "Salary Negotiation Masterclass",
      description: "Learn how to negotiate your salary and get paid what you're worth.",
      youtubeId: "9X5tP3x7QwB",
      duration: "22:30",
      views: "156K",
      category: "Compensation"
    },
    {
      title: "Building Confidence in Your Career",
      description: "Develop the mindset and skills needed to advance in your career.",
      youtubeId: "2Z8oW5g8KjN",
      duration: "14:52",
      views: "78K",
      category: "Personal Growth"
    }
  ];

  const resources = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Career Guides",
      description: "Comprehensive guides for every stage of your career journey"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Video Tutorials",
      description: "Watch expert-led tutorials on various career topics"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Mentorship",
      description: "Connect with experienced professionals in your field"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Skill Assessments",
      description: "Test and validate your skills with industry-standard assessments"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Subscription Status */}
        <SubscriptionStatus />

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Career Advice & Resources
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Expert insights, tips, and resources to help you advance your career and achieve your professional goals.
          </p>
        </div>

        {/* Featured Articles */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {articles.filter(article => article.featured).map((article, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full mb-4">
                    {article.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
                    {article.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {article.readTime}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Videos */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
            Featured Videos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {videos.slice(0, 3).map((video, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full rounded-t-2xl"
                  ></iframe>
                </div>
                <div className="p-6">
                  <span className="inline-block bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm font-medium px-3 py-1 rounded-full mb-3">
                    {video.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 sm:mb-4 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {video.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {video.views} views
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Articles */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {articles.map((article, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded mb-3">
                  {article.category}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {article.readTime}
                  </span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Read
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Videos */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
            More Career Videos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {videos.slice(3).map((video, index) => (
              <div key={index + 3} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full rounded-t-2xl"
                  ></iframe>
                </div>
                <div className="p-4">
                  <span className="inline-block bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-1 rounded mb-2">
                    {video.category}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {video.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {video.views} views
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
            Career Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600 dark:text-blue-400">
                    {resource.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {resource.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CareerAdvice;