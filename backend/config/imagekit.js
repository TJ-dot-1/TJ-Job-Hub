import ImageKit from 'imagekit';

// Validate ImageKit configuration
const requiredEnvVars = {
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required ImageKit environment variables: ${missingVars.join(', ')}`);
}

const imagekit = new ImageKit({
  publicKey: requiredEnvVars.IMAGEKIT_PUBLIC_KEY,
  privateKey: requiredEnvVars.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: requiredEnvVars.IMAGEKIT_URL_ENDPOINT
});

// Verify ImageKit configuration is working
imagekit.listFiles({
  limit: 1
}).then(() => {
  console.log('✅ ImageKit configuration verified successfully');
}).catch((error) => {
  console.error('❌ ImageKit configuration error:', error.message);
  throw error;
});

export default imagekit;