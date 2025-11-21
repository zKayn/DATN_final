// backend/src/services/socket.service.ts

import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

class SocketService {
  private io: SocketServer | null = null;
  private adminSockets: Map<string, Socket> = new Map();
  private userSockets: Map<string, Socket> = new Map();

  initialize(httpServer: HTTPServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.2.122:3000'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('🔌 Client connected:', socket.id);

      // Admin joins
      socket.on('admin:join', (adminId: string) => {
        console.log('👨‍💼 Admin joined:', adminId);
        this.adminSockets.set(adminId, socket);
        socket.join('admins');
      });

      // User joins
      socket.on('user:join', (userId: string) => {
        console.log('👤 User joined:', userId);
        this.userSockets.set(userId, socket);
        socket.join('users');
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
        // Clean up
        this.adminSockets.forEach((s, id) => {
          if (s.id === socket.id) this.adminSockets.delete(id);
        });
        this.userSockets.forEach((s, id) => {
          if (s.id === socket.id) this.userSockets.delete(id);
        });
      });
    });
  }

  // Notify all admins
  notifyAdmins(event: string, data: any) {
    console.log(`📢 Notifying admins: ${event}`, data);
    this.io?.to('admins').emit(event, data);
  }

  // Notify all users
  notifyUsers(event: string, data: any) {
    console.log(`📢 Notifying users: ${event}`, data);
    this.io?.to('users').emit(event, data);
  }

  // Notify specific user
  notifyUser(userId: string, event: string, data: any) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  // Notify everyone
  notifyAll(event: string, data: any) {
    this.io?.emit(event, data);
  }

  getIO() {
    return this.io;
  }
}

export default new SocketService();