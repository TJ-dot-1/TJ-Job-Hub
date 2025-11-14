// ImageKit client-side utility
// Vite exposes env vars via import.meta.env. Support both VITE_ vars and legacy REACT_APP_ vars.
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || import.meta.env.REACT_APP_IMAGEKIT_URL_ENDPOINT || '';
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || import.meta.env.REACT_APP_IMAGEKIT_PUBLIC_KEY || '';

export const getOptimizedImageUrl = (originalUrl, { width, height, quality = 80, format = 'webp' } = {}) => {
  if (!originalUrl || !IMAGEKIT_URL_ENDPOINT || !originalUrl.includes(IMAGEKIT_URL_ENDPOINT)) {
    return originalUrl;
  }

  const tr = [];
  if (width) tr.push(`w-${width}`);
  if (height) tr.push(`h-${height}`);
  if (quality) tr.push(`q-${quality}`);
  if (format) tr.push(`f-${format}`);

  const transformations = tr.join(',');
  return `${originalUrl}?tr=${transformations}`;
};

export const getProfileImageUrl = (imageUrl) => {
  return getOptimizedImageUrl(imageUrl, {
    width: 150,
    height: 150,
    quality: 90,
    format: 'webp'
  });
};

export const getResumePreviewUrl = (resumeUrl) => {
  return getOptimizedImageUrl(resumeUrl, {
    height: 800,
    quality: 75,
    format: 'webp'
  });
};

export const getImageKitConfig = () => {
  return {
    publicKey: IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  };
};