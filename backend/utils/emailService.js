import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text = '') {
    try {
      const mailOptions = {
        from: `"TJ Job Portal" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to TJ Job Portal!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to TJ Job Portal, ${user.name}! 🎉</h2>
        <p>We're excited to have you on board. Your account has been successfully created.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b;">Get Started:</h3>
          <ul>
            <li>Complete your profile to increase visibility</li>
            <li>Upload your resume for quick applications</li>
            <li>Set up job alerts for your preferred roles</li>
            <li>Explore AI-powered job recommendations</li>
          </ul>
        </div>

        <p>Start your journey towards finding your dream job!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            The TJ Job Portal Team
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendApplicationConfirmation(application, job, user) {
    const subject = `Application Submitted: ${job.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Submitted Successfully! ✅</h2>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #15803d;">${job.title}</h3>
          <p><strong>Company:</strong> ${job.company?.name || 'N/A'}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>Applied on:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</p>
        </div>

        <p>Your application has been received and is now under review. We'll notify you of any updates.</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Need help? Contact our support team anytime.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendStatusUpdate(application, job, user, oldStatus, newStatus) {
    const subject = `Application Update: ${job.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Status Updated</h2>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d97706;">${job.title}</h3>
          <p><strong>Company:</strong> ${job.company?.name || 'N/A'}</p>
          <p><strong>Status changed from:</strong> ${oldStatus} → <strong>${newStatus}</strong></p>
          <p><strong>Updated on:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>Login to your dashboard to view more details and take any required actions.</p>

        <a href="${process.env.CLIENT_URL}/dashboard/applications" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Application
        </a>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }
}

export default new EmailService();