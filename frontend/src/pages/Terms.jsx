import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Terms of Service</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Acceptance of Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            By accessing and using TJ Job Portal, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Use License</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Permission is granted to temporarily use TJ Job Portal for personal and commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on our platform</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">User Accounts</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
          </p>
          <p className="text-gray-300 leading-relaxed">
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Content and Conduct</h2>
          <h3 className="text-xl font-medium text-white mb-2">Prohibited Content</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
            <li>False, inaccurate, or misleading information</li>
            <li>Content that violates intellectual property rights</li>
            <li>Harassment, discriminatory, or offensive material</li>
            <li>Spam or unsolicited commercial content</li>
          </ul>

          <h3 className="text-xl font-medium text-white mb-2">User Conduct</h3>
          <p className="text-gray-300 leading-relaxed">
            You agree to use our platform responsibly and in compliance with applicable laws. You may not use our service to engage in any illegal or harmful activities.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Job Postings and Applications</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Employers are responsible for ensuring that all job postings are accurate and comply with applicable employment laws. Job seekers are responsible for providing accurate information in their applications and profiles.
          </p>
          <p className="text-gray-300 leading-relaxed">
            TJ Job Portal reserves the right to remove any content that violates these terms or applicable laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Disclaimer</h2>
          <p className="text-gray-300 leading-relaxed">
            The information on TJ Job Portal is provided on an 'as is' basis. To the fullest extent permitted by law, TJ Job Portal excludes all representations, warranties, conditions and terms whether express or implied, statutory or otherwise.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Limitations</h2>
          <p className="text-gray-300 leading-relaxed">
            In no event shall TJ Job Portal or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Termination</h2>
          <p className="text-gray-300 leading-relaxed">
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at legal@tjjobportal.com or visit our <a href="/contact" className="text-blue-400 hover:text-blue-300">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;