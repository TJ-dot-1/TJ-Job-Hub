import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // For demo purposes, we'll create a mock socket
    // In production, this would connect to your actual server
    const mockSocket = {
      on: (event, callback) => {
        console.log(`Mock socket: listening for ${event}`);
      },
      emit: (event, data) => {
        console.log(`Mock socket: emitting ${event}`, data);
      },
      disconnect: () => {
        console.log('Mock socket: disconnected');
      }
    };

    setSocket(mockSocket);

    return () => {
      if (mockSocket.disconnect) {
        mockSocket.disconnect();
      }
    };
  }, []);

  const value = {
    socket,
    isConnected: true // Mock connection status
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};