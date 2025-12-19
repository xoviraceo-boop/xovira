'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from '@/lib/socket';
import { useToast } from '@/hooks/useToast';
import { useSession } from "next-auth/react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  waitForConnection: () => Promise<Socket>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  waitForConnection: async () => {
    throw new Error('useSocket must be used within SocketProvider');
  },
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const initializingRef = useRef(false);
  const toastShownRef = useRef(false);

  const waitForConnection = useCallback((): Promise<Socket> => {
    return new Promise<Socket>((resolve, reject) => {
      if (!socket) {
        return reject(new Error('Socket not initialized'));
      }

      if (socket.connected) {
        return resolve(socket);
      }

      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Connection timeout'));
      }, 5000);

      const handleConnect = () => {
        cleanup();
        resolve(socket);
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleError = (err: any) => {
        cleanup();
        reject(new Error(err?.message || 'Connection failed'));
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        socket.off('connect', handleConnect);
        socket.off('connect_error', handleError);
      };

      socket.once('connect', handleConnect);
      socket.once('connect_error', handleError);
    });
  }, [socket]);

  useEffect(() => {
    let mounted = true;

    const initializeSocket = async () => {
      // Prevent multiple simultaneous initializations
      if (initializingRef.current) return;
      
      if (status !== 'authenticated') {
        return;
      }

      initializingRef.current = true;

      try {
        const socketInstance = await initSocket();

        if (!mounted) {
          socketInstance.disconnect();
          return;
        }

        setSocket(socketInstance);

        // Connection handlers
        const handleConnect = () => {
          console.log('✅ Socket connected');
          setIsConnected(true);
          toastShownRef.current = false;
        };

        const handleDisconnect = (reason: string) => {
          console.log('❌ Socket disconnected:', reason);
          setIsConnected(false);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleConnectError = (error: any) => {
          console.error('Socket connection error:', error);
          
          // Show toast only once
          if (!toastShownRef.current) {
            toast({
              title: 'Connection Error',
              description: 'Failed to connect to real-time server',
              variant: 'destructive',
            });
            toastShownRef.current = true;
          }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleError = (error: any) => {
          console.error('Socket error:', error);
          toast({
            title: 'Error',
            description: error.message || 'An error occurred',
            variant: 'destructive',
          });
        };

        // Remove existing listeners first
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('connect_error', handleConnectError);
        socketInstance.off('error', handleError);

        // Add listeners
        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);
        socketInstance.on('error', handleError);

        // Set initial connection state
        setIsConnected(socketInstance.connected);

      } catch (error) {
        console.error('Error initializing socket:', error);
        if (mounted) {
          toast({
            title: 'Connection Error',
            description: 'Failed to initialize connection',
            variant: 'destructive',
          });
        }
      } finally {
        initializingRef.current = false;
      }
    };

    initializeSocket();

    return () => {
      mounted = false;
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      initializingRef.current = false;
    };
  }, [status, toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, waitForConnection }}>
      {children}
    </SocketContext.Provider>
  );
}