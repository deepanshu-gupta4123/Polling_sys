import pollStore from '../store/pollStore.js';

export function setupPollSocket(io) {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Teacher creates a new poll
        socket.on('teacher:create_poll', (data, callback) => {
            const poll = pollStore.createPoll(data.title, data.description);
            socket.join(`poll:${poll.id}`);

            pollStore.addParticipant(socket.id, poll.id, 'Teacher', 'teacher');

            callback({ success: true, poll });
        });

        // Student joins any active poll (for simplified flow)
        socket.on('student:join_any_poll', (data, callback) => {
            const { name } = data;
            // Find the most recently created poll
            const polls = Array.from(pollStore.polls.values());
            const poll = polls[polls.length - 1]; // Get last created

            if (!poll) {
                callback({ success: false, error: 'No active poll found' });
                return;
            }

            socket.join(`poll:${poll.id}`);
            pollStore.addParticipant(socket.id, poll.id, name, 'student');

            const currentQuestion = pollStore.getCurrentQuestion(poll.id);
            const results = pollStore.getResults(poll.id);

            callback({
                success: true,
                poll,
                currentQuestion,
                results
            });

            socket.to(`poll:${poll.id}`).emit('student:joined', {
                name,
                participants: pollStore.getActivePollParticipants(poll.id)
            });
        });

        // Student joins a specific poll
        socket.on('student:join_poll', (data, callback) => {
            const { pollId, name } = data;
            const poll = pollStore.getPoll(pollId);

            if (!poll) {
                callback({ success: false, error: 'Poll not found' });
                return;
            }

            socket.join(`poll:${pollId}`);
            pollStore.addParticipant(socket.id, pollId, name, 'student');

            // Send current poll state
            const currentQuestion = pollStore.getCurrentQuestion(pollId);
            const results = pollStore.getResults(pollId);

            callback({
                success: true,
                poll,
                currentQuestion,
                results
            });

            // Notify others
            socket.to(`poll:${pollId}`).emit('student:joined', {
                name,
                participants: pollStore.getActivePollParticipants(pollId)
            });
        });

        // ... (keep existing code) ...

        // Teacher starts a question
        socket.on('teacher:start_question', (data, callback) => {
            const { pollId, questionData } = data;

            if (!pollStore.canStartNewQuestion(pollId)) {
                callback({
                    success: false,
                    error: 'Cannot start new question. Previous question still active.'
                });
                return;
            }

            const question = pollStore.addQuestion(pollId, questionData);
            pollStore.startQuestion(pollId, question.id);

            // Set up auto-close timer
            const timer = setTimeout(() => {
                const closedQ = pollStore.closeQuestion(pollId, question.id);
                if (closedQ) {
                    io.to(`poll:${pollId}`).emit('question:closed', {
                        questionId: question.id,
                        reason: 'timeout',
                        results: getQuestionResults(closedQ)
                    });
                }
            }, question.timeLimitSeconds * 1000);

            pollStore.setQuestionTimer(question.id, timer);

            // Broadcast to all students
            io.to(`poll:${pollId}`).emit('question:started', {
                question: {
                    id: question.id,
                    text: question.text,
                    options: question.options,
                    timeLimitSeconds: question.timeLimitSeconds,
                    startedAt: question.startedAt
                }
            });

            callback({ success: true, question });
        });

        // Student submits answer
        socket.on('student:submit_answer', (data, callback) => {
            const { pollId, questionId, optionId } = data;

            const question = pollStore.recordVote(pollId, questionId, socket.id, optionId);

            if (!question) {
                callback({ success: false, error: 'Invalid vote or already answered' });
                return;
            }

            callback({ success: true });

            // Broadcast updated results
            const results = getQuestionResults(question);
            io.to(`poll:${pollId}`).emit('results:update', {
                questionId,
                results
            });

            // Check if all students answered
            const participants = pollStore.getActivePollParticipants(pollId);
            if (question.answeredBy.size >= participants.length && participants.length > 0) {
                // All answered, close question
                pollStore.closeQuestion(pollId, questionId);
                io.to(`poll:${pollId}`).emit('question:closed', {
                    questionId,
                    reason: 'all_answered',
                    results
                });
            }
        });

        // Teacher manually closes question
        socket.on('teacher:close_question', (data, callback) => {
            const { pollId, questionId } = data;
            const question = pollStore.closeQuestion(pollId, questionId);

            if (!question) {
                callback({ success: false, error: 'Question not found' });
                return;
            }

            const results = getQuestionResults(question);
            io.to(`poll:${pollId}`).emit('question:closed', {
                questionId,
                reason: 'manual',
                results
            });

            callback({ success: true });
        });

        // Teacher removes a student
        socket.on('teacher:remove_student', (data) => {
            const { pollId, studentSocketId } = data;
            const participant = pollStore.removeParticipant(studentSocketId);

            if (participant) {
                io.to(studentSocketId).emit('student:removed', {
                    message: 'You have been removed from the poll'
                });

                // Force disconnect
                const studentSocket = io.sockets.sockets.get(studentSocketId);
                if (studentSocket) {
                    studentSocket.leave(`poll:${pollId}`);
                }

                // Broadcast to others that student left
                io.to(`poll:${pollId}`).emit('student:left', {
                    name: participant.name,
                    participants: pollStore.getActivePollParticipants(pollId)
                });
            }
        });

        // Chat message
        socket.on('chat:send_message', (data) => {
            const { pollId, message } = data;
            const participant = pollStore.getParticipant(socket.id);

            if (!participant) return;

            io.to(`poll:${pollId}`).emit('chat:new_message', {
                sender: participant.name,
                role: participant.role,
                message,
                socketId: socket.id,
                timestamp: new Date().toISOString()
            });
        });

        // Get current poll state
        socket.on('poll:get_state', (data, callback) => {
            const { pollId } = data;
            const poll = pollStore.getPoll(pollId);

            if (!poll) {
                callback({ success: false, error: 'Poll not found' });
                return;
            }

            const currentQuestion = pollStore.getCurrentQuestion(pollId);
            const results = pollStore.getResults(pollId);
            const participants = pollStore.getActivePollParticipants(pollId);

            callback({
                success: true,
                poll,
                currentQuestion,
                results,
                participants
            });
        });


        socket.on('disconnect', () => {
            const participant = pollStore.getParticipant(socket.id);
            if (participant) {
                // If teacher disconnects, disconnect all students from that poll
                if (participant.role === 'teacher') {
                    const allParticipants = pollStore.getActivePollParticipants(participant.pollId);
                    allParticipants.forEach(p => {
                        if (p.socketId !== socket.id) {
                            io.to(p.socketId).emit('poll:closed', {
                                message: 'Teacher has left the poll'
                            });
                        }
                    });
                    console.log(`Teacher disconnected, closed poll: ${participant.pollId}`);
                    pollStore.removePoll(participant.pollId);
                } else {
                    pollStore.removeParticipant(socket.id);
                    socket.to(`poll:${participant.pollId}`).emit('student:left', {
                        name: participant.name,
                        participants: pollStore.getActivePollParticipants(participant.pollId)
                    });
                }
            }
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

function getQuestionResults(question) {
    const totalVotes = Object.values(question.votes).reduce((sum, v) => sum + v, 0);

    return {
        options: question.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: question.votes[opt.id] || 0,
            percentage: totalVotes > 0
                ? Math.round((question.votes[opt.id] / totalVotes) * 100)
                : 0
        })),
        totalVotes,
        answeredCount: question.answeredBy.size
    };
}
