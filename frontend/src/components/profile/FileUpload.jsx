import { useState } from 'react';
import api from '../../utils/api';

const FileUpload = ({ type, onSuccess, currentFile }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentFile);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (type === 'avatar') {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
    } else if (type === 'resume') {
      if (!['application/pdf'].includes(file.type)) {
        setError('Please upload a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File must be less than 10MB');
        return;
      }
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await api.post(`/profile/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        if (type === 'avatar') {
          setPreview(response.data.avatar);
        } else {
          setPreview(response.data.resumePreview);
        }
        onSuccess?.(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await api.delete(`/profile/${type}`);
      if (response.data.success) {
        setPreview(null);
        onSuccess?.(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Deletion failed');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center">
        {preview ? (
          <div className="relative">
            {type === 'avatar' ? (
              <img
                src={preview}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="border rounded p-4 flex items-center space-x-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-600">Resume uploaded</span>
              </div>
            )}
            <button
              onClick={handleDelete}
              className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="cursor-pointer group">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500">
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={type === 'avatar' ? 'image/*' : '.pdf'}
                disabled={uploading}
              />
              <svg
                className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-600">
                {uploading ? 'Uploading...' : `Click to upload ${type}`}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {type === 'avatar'
                  ? 'PNG, JPG, GIF up to 5MB'
                  : 'PDF up to 10MB'}
              </p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default FileUpload;