import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import socketService from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [pollId, setPollId] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [results, setResults] = useState(null);
    const [participantCount, setParticipantCount] = useState(0);
    const [participants, setParticipants] = useState([]);
    const [pollHistory, setPollHistory] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Use ref to access latest pollId inside event listeners
    const pollIdRef = useRef(pollId);
    useEffect(() => {
        pollIdRef.current = pollId;
    }, [pollId]);

    useEffect(() => {
        const socketInstance = socketService.connect();
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        // Listen for poll closed (teacher left)
        socketInstance.on('poll:closed', (data) => {
            console.log('Poll closed:', data.message);
            alert(data.message);
            window.location.href = '/';
        });

        // Listen for being removed by teacher
        socketInstance.on('student:removed', (data) => {
            alert(data.message);
            window.location.href = '/';
        });

        // Listen for question started
        socketService.onQuestionStarted((data) => {
            console.log('Question started:', data);
            setCurrentQuestion(data.question);
        });

        // Listen for question closed
        socketService.onQuestionClosed((data) => {
            console.log('Question closed:', data);
            setCurrentQuestion(null);
            setResults(data.results);

            // Fetch latest state to update history with full details
            const currentPollId = pollIdRef.current;
            if (currentPollId) {
                console.log('Fetching history for poll:', currentPollId);
                socketService.socket.emit('poll:get_state', { pollId: currentPollId }, (response) => {
                    if (response.success && response.results?.questions) {
                        console.log('Updated history:', response.results.questions);
                        setPollHistory(response.results.questions);
                    }
                });
            } else {
                console.warn('No pollId found when question closed');
            }
        });

        // Listen for results update
        socketService.onResultsUpdate((data) => {
            console.log('Results updated:', data);
            setResults(data.results);
        });

        // Listen for student joined/left
        socketService.onStudentJoined((data) => {
            console.log('Student joined:', data);
            if (data.participants) {
                setParticipants(data.participants);
                setParticipantCount(data.participants.length);
            } else {
                setParticipantCount(data.participantCount);
            }
        });

        socketService.onStudentLeft((data) => {
            console.log('Student left:', data);
            if (data.participants) {
                setParticipants(data.participants);
                setParticipantCount(data.participants.length);
            } else {
                setParticipantCount(data.participantCount);
            }
        });

        return () => {
            socketService.disconnect();
        };
    }, []);

    const value = {
        socket,
        pollId,
        setPollId,
        currentQuestion,
        setCurrentQuestion,
        results,
        setResults,
        participantCount,
        setParticipantCount,
        participants,
        setParticipants,
        pollHistory,
        setPollHistory,
        isConnected,
        socketService,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
