import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const isGitHubPages = window.location.hostname.endsWith('github.io');
    const socketHost = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;

    // Skip connecting to origin on GitHub Pages if no backend socket URL is configured
    if (isGitHubPages && !socketHost) {
      return;
    }

    const host = socketHost || window.location.origin;
    const newSocket = io(host, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 3
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
