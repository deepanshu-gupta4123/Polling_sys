import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import pollRoutes from './routes/pollRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { setupPollSocket } from './socket/pollSocket.js';

connectDB();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "https://polling-system-kappa-smoky.vercel.app",
    "https://pollingsystemfrontend.vercel.app"
].filter(Boolean);

// Create a unique set of origins with and without trailing slashes for robustness
const corsOrigins = [...new Set(allowedOrigins.flatMap(origin => [
    origin.replace(/\/$/, ""),
    origin.replace(/\/$/, "") + "/"
]))];

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: corsOrigins,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    console.log('Body:', req.body);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', pollRoutes);

// Setup Socket.io
setupPollSocket(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io ready for connections`);
});

