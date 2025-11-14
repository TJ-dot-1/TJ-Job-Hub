/* eslint-env node */
/* global process */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up TJ Job Portal...\n');

// Check if Node.js version is sufficient
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required');
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Create environment files
const envExample = `
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI="mongodb+srv://jobhub:jobhub1@cluster0.lejxzqu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Cloudinary (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Service (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# External APIs (Optional)
OPENAI_API_KEY=your-openai-api-key
`.trim();

const frontendEnv = `
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=TJ Job Portal
`.trim();

try {
  // Create backend .env
  const serverEnvPath = path.join(__dirname, '..', 'server', '.env');
  if (!fs.existsSync(serverEnvPath)) {
    // Ensure server directory exists
    const serverDir = path.dirname(serverEnvPath);
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }
    fs.writeFileSync(serverEnvPath, envExample);
    console.log('✅ Created server/.env file');
  } else {
    console.log('⚠️ server/.env already exists');
  }

  // Create frontend .env
  const clientEnvPath = path.join(__dirname, '..', 'client', '.env');
  if (!fs.existsSync(clientEnvPath)) {
    // Ensure client directory exists
    const clientDir = path.dirname(clientEnvPath);
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
    }
    fs.writeFileSync(clientEnvPath, frontendEnv);
    console.log('✅ Created client/.env file');
  } else {
    console.log('⚠️ client/.env already exists');
  }

  console.log('\n📦 Installing dependencies...');

  // Install backend dependencies
  console.log('\n🔧 Installing backend dependencies...');
  const serverDir = path.join(__dirname, '..', 'server');
  if (fs.existsSync(serverDir)) {
    execSync('npm install', { cwd: serverDir, stdio: 'inherit' });
  } else {
    console.log('❌ Server directory not found');
  }

  // Install frontend dependencies
  console.log('\n🎨 Installing frontend dependencies...');
  const clientDir = path.join(__dirname, '..', 'client');
  if (fs.existsSync(clientDir)) {
    execSync('npm install', { cwd: clientDir, stdio: 'inherit' });
  } else {
    console.log('❌ Client directory not found');
  }

  console.log('\n✅ All dependencies installed successfully!');

  console.log('\n🎉 Setup completed! Next steps:');
  console.log('1. Make sure MongoDB and Redis are running');
  console.log('2. Start the development servers:');
  console.log('   - Backend: cd server && npm run dev');
  console.log('   - Frontend: cd client && npm run dev');
  console.log('3. Visit http://localhost:3000 to see the application');
  console.log('\n📝 Default accounts will be created on first run');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}