// SportShopApp/src/services/socket.ts

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.2.122:5000';

type EventCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private userId: string | null = null;

  async connect(userId: string): Promise<void> {
    if (this.socket?.connected) {
      console.log('⚠️ Socket already connected');
      return;
    }

    this.userId = userId;

    console.log('🔌 Connecting to socket server:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      // Join user room
      this.socket?.emit('user:join', userId);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('🔴 Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      // Rejoin user room
      if (this.userId) {
        this.socket?.emit('user:join', this.userId);
      }
    });

    // Setup all previously registered listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  on(event: string, callback: EventCallback): void {
    // Store listener for reconnection
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // If already connected, attach listener immediately
    if (this.socket?.connected) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: EventCallback): void {
    // Remove from stored listeners
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    // Remove from socket
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit, socket not connected');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();