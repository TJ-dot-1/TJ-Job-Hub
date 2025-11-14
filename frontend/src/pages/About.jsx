import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">About Us</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            At TJ Job Portal, we are committed to empowering decent work through digital innovation. Our platform connects talented individuals with meaningful opportunities worldwide, fostering a global community of professionals and employers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">What We Do</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We provide a comprehensive job portal that serves both job seekers and employers. Our platform features advanced search capabilities, skill assessments, career advice, and powerful recruitment tools to streamline the hiring process.
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Connect job seekers with relevant opportunities</li>
            <li>Help employers find the right talent</li>
            <li>Offer skill assessments and career guidance</li>
            <li>Provide analytics and insights for better decision-making</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Innovation</h3>
              <p className="text-gray-300">We leverage cutting-edge technology to create better experiences for everyone.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Inclusivity</h3>
              <p className="text-gray-300">We believe in equal opportunities for all, regardless of background or location.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Integrity</h3>
              <p className="text-gray-300">We maintain the highest standards of honesty and transparency in all our operations.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Excellence</h3>
              <p className="text-gray-300">We strive for excellence in everything we do, from user experience to service quality.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
          <p className="text-gray-300 leading-relaxed">
            Have questions or feedback? We'd love to hear from you. Visit our <a href="/contact" className="text-blue-400 hover:text-blue-300">Contact page</a> to reach out.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;