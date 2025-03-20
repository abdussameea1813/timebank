import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import serviceRoutes from './routes/service.route.js';
import transactionRoutes from './routes/transaction.route.js';
import reviewRoutes from './routes/review.route.js';
import messageRoutes from './routes/message.route.js';
import jwt from 'jsonwebtoken';
import User from './models/user.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// Make io available to all routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket.io authentication and setup
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return next(new Error('User not found'));
        }
        
        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Join a room based on user ID for direct messages
    socket.join(socket.user._id.toString());
    
    // Handle transaction requests
    socket.on('transaction_request', async (data) => {
        const { providerId, transactionId } = data;
        io.to(providerId).emit('new_transaction', { transactionId });
    });
    
    // Handle transaction status updates
    socket.on('transaction_update', async (data) => {
        const { transactionId, status, recipientId, providerId } = data;
        
        // Notify the other party about the status change
        const targetId = socket.user._id.toString() === providerId ? recipientId : providerId;
        io.to(targetId).emit('transaction_status_changed', { transactionId, status });
    });
    
    // Handle private messaging
    socket.on('send_message', async (data) => {
        const { recipientId, message } = data;
        
        // Emit to recipient
        io.to(recipientId).emit('new_message', {
            message,
            sender: socket.user._id,
            senderName: socket.user.name,
            timestamp: new Date()
        });
    });
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user._id}`);
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/messages', messageRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    // Correct the path to the dist folder based on the actual location
    app.use(express.static(path.join(__dirname, '..', 'timebank-frontend', 'dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'timebank-frontend', 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 9000;

server.listen(PORT, () => {
    connectDB(); 
    console.log(`Server is running on port ${PORT}`);
});
