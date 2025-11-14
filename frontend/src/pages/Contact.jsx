import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Contact Us</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We'd love to hear from you! Whether you have questions about our platform, need support, or want to provide feedback, our team is here to help.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium text-white mb-2">General Inquiries</h3>
              <p className="text-gray-300 mb-2">Email: info@tjjobportal.com</p>
              <p className="text-gray-300 mb-2">Phone: +254 706667129</p>
              <p className="text-gray-300">Hours: Monday - Friday, 9 AM - 6 PM EAT</p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Support</h3>
              <p className="text-gray-300 mb-2">Email: support@tjjobportal.com</p>
              <p className="text-gray-300 mb-2">Phone: +254 706667129</p>
              <p className="text-gray-300">Response time: Within 24 hours</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Office Location</h2>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-300 mb-2">TJ Job Hub Headquarters</p>
            <p className="text-gray-300 mb-2">123 Innovation Drive</p>
            <p className="text-gray-300 mb-2">Tech City, TC 12345</p>
            <p className="text-gray-300">Kenya, Nairobi</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Follow Us</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Stay connected with us on social media for the latest updates, job opportunities, and career tips.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-blue-400 hover:text-blue-300">LinkedIn</a>
            <a href="#" className="text-blue-400 hover:text-blue-300">Twitter</a>
            <a href="#" className="text-blue-400 hover:text-blue-300">Facebook</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;