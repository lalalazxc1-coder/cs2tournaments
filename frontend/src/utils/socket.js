import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || '/';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            path: '/api/socket.io',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: {
                token: localStorage.getItem('token')
            }
        });

        this.socket.on('connect', () => {
            this.connected = true;
        });

        this.socket.on('disconnect', (reason) => {
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            // Silent error handling or send to analytics
        });

        this.socket.on('reconnect', (attemptNumber) => {
            // Reconnected
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    // Подписаться на турнир
    joinTournament(tournamentId) {
        if (!this.socket) this.connect();
        this.socket.emit('join:tournament', tournamentId);
    }

    // Отписаться от турнира
    leaveTournament(tournamentId) {
        if (!this.socket) return;
        this.socket.emit('leave:tournament', tournamentId);
    }

    // Подписаться на уведомления пользователя
    joinNotifications(userId) {
        if (!this.socket) this.connect();
        this.socket.emit('join:notifications', userId);
    }

    // Слушать события
    on(event, callback) {
        if (!this.socket) this.connect();
        this.socket.on(event, callback);
    }

    // Отписаться от события
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    // Проверка подключения
    isConnected() {
        return this.connected && this.socket?.connected;
    }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
