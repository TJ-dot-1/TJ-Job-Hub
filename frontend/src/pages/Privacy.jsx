import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Privacy Policy</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
          <p className="text-gray-300 leading-relaxed">
            At TJ Job Portal, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
          <h3 className="text-xl font-medium text-white mb-2">Personal Information</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
            <li>Name, email address, and contact information</li>
            <li>Professional background and work experience</li>
            <li>Resume and portfolio information</li>
            <li>Account credentials and preferences</li>
          </ul>

          <h3 className="text-xl font-medium text-white mb-2">Usage Data</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>IP address and location information</li>
            <li>Browser type and device information</li>
            <li>Pages visited and time spent on our platform</li>
            <li>Job search and application history</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>To provide and maintain our job portal services</li>
            <li>To match job seekers with relevant opportunities</li>
            <li>To facilitate communication between employers and candidates</li>
            <li>To improve our platform and develop new features</li>
            <li>To send important updates and notifications</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
          <p className="text-gray-300 leading-relaxed">
            We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Data Sharing</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>With your explicit consent</li>
            <li>To comply with legal requirements</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With service providers who help us operate our platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Access and review your personal information</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@tjjobportal.com or visit our <a href="/contact" className="text-blue-400 hover:text-blue-300">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;