import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import initializeSocket from './sockets/socket.js';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

initializeSocket(io);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
