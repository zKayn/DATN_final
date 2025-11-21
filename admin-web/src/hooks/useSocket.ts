// admin-web/src/hooks/useSocket.ts

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = 'http://192.168.1.187:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // Connect to socket
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      // Join admin room
      socket.emit('admin:join', user.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socketRef.current;
};