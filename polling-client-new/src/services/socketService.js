import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to server:', this.socket.id);
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Disconnected from server');
            });

            this.socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }

    // Teacher Events
    createPoll(title, description, callback) {
        this.socket?.emit('teacher:create_poll', { title, description }, callback);
    }

    startQuestion(pollId, questionData, callback) {
        this.socket?.emit('teacher:start_question', { pollId, questionData }, callback);
    }

    closeQuestion(pollId, questionId, callback) {
        this.socket?.emit('teacher:close_question', { pollId, questionId }, callback);
    }

    // Student Events
    joinAnyPoll(name, callback) {
        this.socket?.emit('student:join_any_poll', { name }, callback);
    }

    submitAnswer(pollId, questionId, optionId, callback) {
        this.socket?.emit('student:submit_answer', { pollId, questionId, optionId }, callback);
    }

    // Listeners
    onQuestionStarted(callback) {
        this.socket?.on('question:started', callback);
    }

    onQuestionClosed(callback) {
        this.socket?.on('question:closed', callback);
    }

    onResultsUpdate(callback) {
        this.socket?.on('results:update', callback);
    }

    onStudentJoined(callback) {
        this.socket?.on('student:joined', callback);
    }

    onStudentLeft(callback) {
        this.socket?.on('student:left', callback);
    }

    // Remove listeners
    off(event, callback) {
        this.socket?.off(event, callback);
    }
}

export default new SocketService();
