import React, { useState } from 'react';
import { Upload, Building, Globe } from 'lucide-react';

const CompanySetup = ({ onCompanyUpdate, companyData = {} }) => {
  const [company, setCompany] = useState({
    name: companyData.name || '',
    logo: companyData.logo || '',
    website: companyData.website || '',
    description: companyData.description || '',
    industry: companyData.industry || '',
    size: companyData.size || '',
    ...companyData
  });

  const [logoPreview, setLogoPreview] = useState(company.logo);

  const handleInputChange = (field, value) => {
    const updatedCompany = { ...company, [field]: value };
    setCompany(updatedCompany);
    onCompanyUpdate(updatedCompany);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target.result;
        setLogoPreview(logoUrl);
        handleInputChange('logo', logoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
    'Manufacturing', 'Consulting', 'Media', 'Real Estate', 'Other'
  ];

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees',
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Set Up Your Company Profile
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tell us about your company to attract the best candidates
        </p>
      </div>

      {/* Company Logo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Company Logo
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Company logo" className="w-full h-full object-cover" />
            ) : (
              <Building className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              PNG, JPG up to 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Company Name *
        </label>
        <input
          type="text"
          value={company.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder="Enter your company name"
          required
        />
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Company Website
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="url"
            value={company.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="https://www.yourcompany.com"
          />
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Industry
        </label>
        <select
          value={company.industry}
          onChange={(e) => handleInputChange('industry', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Select industry</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      {/* Company Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Company Size
        </label>
        <select
          value={company.size}
          onChange={(e) => handleInputChange('size', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Select company size</option>
          {companySizes.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Company Description
        </label>
        <textarea
          value={company.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder="Tell us about your company, mission, and what makes you unique..."
        />
      </div>
    </div>
  );
};

export default CompanySetup;