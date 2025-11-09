import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const HeroSearch = () => {
  const [searchData, setSearchData] = useState({
    query: '',
    location: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchData.query || searchData.location) {
      const params = new URLSearchParams();
      if (searchData.query) params.set('query', searchData.query);
      if (searchData.location) params.set('location', searchData.location);
      navigate(`/jobs?${params.toString()}`);
    }
  };

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 sm:gap-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            name="query"
            value={searchData.query}
            onChange={handleChange}
            placeholder="Job title, keywords, or company"
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-gray-900 placeholder-gray-500 outline-none rounded-lg text-lg sm:text-xl"
          />
        </div>

        <div className="flex-1 relative">
          <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            name="location"
            value={searchData.location}
            onChange={handleChange}
            placeholder="City, state, or remote"
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-gray-900 placeholder-gray-500 outline-none rounded-lg text-lg sm:text-xl"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-lg sm:text-xl"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Search Jobs</span>
        </button>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-center gap-2 px-4 sm:gap-3">
        {['Remote', 'Frontend', 'Backend', 'Full Stack', 'React', 'Node.js', 'Python', 'JavaScript', 'Java', 'DevOps'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setSearchData({ ...searchData, query: tag });
              setTimeout(() => {
                navigate(`/jobs?query=${tag}`);
              }, 100);
            }}
            className="px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-sm text-white rounded-full text-base sm:text-lg hover:bg-white/20 transition-colors border border-white/20"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
};

export default HeroSearch;