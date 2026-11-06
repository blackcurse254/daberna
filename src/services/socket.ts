import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private listeners: Set<(connected: boolean) => void> = new Set();

  public getSocket(): Socket {
    if (!this.socket) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('daberna_token') : null;

      this.socket = io({
        autoConnect: true,
        transports: ['websocket', 'polling'],
        auth: {
          token
        },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.notifyListeners();
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.notifyListeners();
      });

      this.socket.on('connect_error', () => {
        this.isConnected = false;
        this.notifyListeners();
      });
    }

    return this.socket;
  }

  public updateAuthToken(token: string | null) {
    if (this.socket) {
      this.socket.auth = { token };
      if (this.socket.connected) {
        this.socket.disconnect().connect();
      }
    }
  }

  public subscribeConnectionStatus(callback: (connected: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.isConnected);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.isConnected));
  }
}

export const socketService = new SocketService();
export const socket = socketService.getSocket();
