import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const showToast = {
    success: (message, options = {}) => toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options
    }),
    error: (message, options = {}) => toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options
    }),
    warning: (message, options = {}) => toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      ...options
    }),
    info: (message, options = {}) => toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      ...options
    }),
    loading: (message, options = {}) => toast.loading(message, {
      position: 'top-right',
      ...options
    }),
    dismiss: (toastId) => toast.dismiss(toastId)
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
};