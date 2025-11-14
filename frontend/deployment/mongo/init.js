/* eslint-disable no-global-assign */
/* global db */
// Initialize database with sample data
db = db.getSiblingDB('tj-job-portal');

// Create collections
db.createCollection('users');
db.createCollection('jobs');
db.createCollection('applications');
db.createCollection('chats');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ 'profile.skills.name': 1 });
db.users.createIndex({ 'profile.location.coordinates': '2dsphere' });

db.jobs.createIndex({ title: 'text', description: 'text' });
db.jobs.createIndex({ category: 1, jobType: 1, location: 1 });
db.jobs.createIndex({ 'salary.min': 1, 'salary.max': 1 });
db.jobs.createIndex({ coordinates: '2dsphere' });
db.jobs.createIndex({ status: 1, deadline: 1 });

db.applications.createIndex({ job: 1, user: 1 }, { unique: true });
db.applications.createIndex({ user: 1, appliedAt: -1 });
db.applications.createIndex({ job: 1, status: 1 });

db.chats.createIndex({ 'participants.user': 1 });
db.chats.createIndex({ job: 1 });
db.chats.createIndex({ updatedAt: -1 });

// Insert sample admin user
db.users.insertOne({
  name: 'Admin User',
  email: 'admin@tjjobportal.com',
  password: '$2a$12$LQv3c1yqBNWR1Zx8eY7JcOe6oQJ8qZ5XfY9gC3dH2iK7lN9mS4tW', // password: admin123
  role: 'admin',
  profile: {
    headline: 'System Administrator',
    bio: 'Managing the TJ Job Portal platform',
    avatar: '',
    skills: [
      { name: 'System Administration', level: 'expert', verified: true },
      { name: 'Database Management', level: 'expert', verified: true },
      { name: 'Security', level: 'expert', verified: true }
    ]
  },
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ Database initialized successfully');