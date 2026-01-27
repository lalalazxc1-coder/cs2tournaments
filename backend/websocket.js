const { Server } = require('socket.io');

let io;

function initializeWebSocket(httpServer) {
    io = new Server(httpServer, {
        path: '/api/socket.io',
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
        console.log(`✅ WebSocket клиент подключен: ${socket.id}`);

        // Подключение к комнате турнира
        socket.on('join:tournament', (tournamentId) => {
            socket.join(`tournament:${tournamentId}`);
            console.log(`📥 Клиент ${socket.id} присоединился к турниру ${tournamentId}`);
        });

        // Отключение от комнаты турнира
        socket.on('leave:tournament', (tournamentId) => {
            socket.leave(`tournament:${tournamentId}`);
            console.log(`📤 Клиент ${socket.id} покинул турнир ${tournamentId}`);
        });

        // Подключение к комнате уведомлений пользователя
        socket.on('join:notifications', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`🔔 Клиент ${socket.id} подписан на уведомления пользователя ${userId}`);
        });

        socket.on('disconnect', () => {
            console.log(`❌ WebSocket клиент отключен: ${socket.id}`);
        });
    });

    return io;
}

// Функция для отправки обновлений турнира
function emitTournamentUpdate(tournamentId, data) {
    if (io) {
        io.to(`tournament:${tournamentId}`).emit('tournament:update', data);
        console.log(`📡 Отправлено обновление турнира ${tournamentId}`);
    }
}

// Функция для отправки обновлений драфта
function emitDraftUpdate(tournamentId, draftState) {
    if (io) {
        io.to(`tournament:${tournamentId}`).emit('draft:update', draftState);
        console.log(`🎯 Отправлено обновление драфта турнира ${tournamentId}`);
    }
}

// Функция для отправки уведомлений пользователю
function emitNotification(userId, notification) {
    if (io) {
        io.to(`user:${userId}`).emit('notification:new', notification);
        console.log(`🔔 Отправлено уведомление пользователю ${userId}`);
    }
}

// Функция для отправки уведомления о новом лобби всем подключенным клиентам
function broadcastLobbyCreated(lobby) {
    if (io) {
        io.emit('lobby:created', lobby);
        console.log(`📢 Отправлено уведомление о новом лобби ${lobby.id} всем клиентам`);
    }
}

module.exports = {
    initializeWebSocket,
    emitTournamentUpdate,
    emitDraftUpdate,
    emitNotification,
    broadcastLobbyCreated
};
