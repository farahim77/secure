import io, { Socket } from 'socket.io-client';

class SocketService {

  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    this.socket = io('http://localhost:5000/api', {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to Flask backend');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Flask backend');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('join_room', { room });
    }
  }

  leaveRoom(room: string) {
    if (this.socket) {
      this.socket.emit('leave_room', { room });
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();

