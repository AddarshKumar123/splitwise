import jwt from 'jsonwebtoken';
import { createComment } from '../services/comment.service.js';

const initializeSocket = (io) => {
    // Socket authentication middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            socket.user = { userId: decoded.userId };
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.user.userId);

        // Join expense room
        socket.on('joinExpense', (expenseId) => {
            const roomName = `expense:${expenseId}`;
            socket.join(roomName);
            console.log(`User ${socket.user.userId} joined room ${roomName}`);
        });

        // Leave expense room
        socket.on('leaveExpense', (expenseId) => {
            const roomName = `expense:${expenseId}`;
            socket.leave(roomName);
            console.log(`User ${socket.user.userId} left room ${roomName}`);
        });

        // Send comment
        socket.on('sendComment', async (data) => {
            try {
                const { expenseId, message } = data;

                // Validate input
                if (!expenseId || !message || message.trim() === '') {
                    socket.emit('error', { message: 'Invalid comment data' });
                    return;
                }

                // Create comment in DB
                const comment = await createComment(expenseId, message, socket.user.userId);

                // Broadcast to room
                const roomName = `expense:${expenseId}`;
                io.to(roomName).emit('receiveComment', comment);

            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.user.userId);
        });
    });
};

export default initializeSocket;
