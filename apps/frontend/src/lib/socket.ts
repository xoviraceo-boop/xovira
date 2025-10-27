// lib/socket.ts
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket-events';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let tokenPromise: Promise<string> | null = null;

const fetchAuthToken = async (): Promise<string> => {
  // Cache token fetch to prevent multiple simultaneous requests
  if (!tokenPromise) {
    tokenPromise = (async () => {
      try {
        const res = await fetch('/api/auth/token', { credentials: 'include' });
        if (!res.ok) throw new Error('Unable to fetch auth token');
        const { token } = await res.json();
        return token;
      } finally {
        tokenPromise = null;
      }
    })();
  }
  return tokenPromise;
};

const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

const startHeartbeat = (socketInstance: Socket) => {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socketInstance?.connected) {
      socketInstance.emit('connection:ping' as any);
    }
  }, 30000);
};

export const initSocket = async () => {
  // Return existing connected socket
  if (socket?.connected) return socket;

  // Clean up existing socket if not connected
  if (socket) {
    stopHeartbeat();
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  const token = await fetchAuthToken();

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'], // Prefer websocket
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity, // Keep trying
    timeout: 20000,
    withCredentials: true,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected');
    startHeartbeat(socket!);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
    stopHeartbeat();
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  stopHeartbeat();
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};