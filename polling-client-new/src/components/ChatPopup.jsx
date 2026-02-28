import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Users, UserMinus } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const ChatPopup = ({ isTeacher = false }) => {
    const { socketService, pollId, participants } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'participants'
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socketService) return;

        const handleNewMessage = (data) => {
            setMessages((prev) => [...prev, data]);
        };

        socketService.socket?.on('chat:new_message', handleNewMessage);

        return () => {
            socketService.socket?.off('chat:new_message', handleNewMessage);
        };
    }, [socketService]);

    useEffect(() => {
        if (isOpen && activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, isOpen, activeTab]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !pollId) return;

        socketService.socket?.emit('chat:send_message', {
            pollId,
            message: message.trim()
        });
        setMessage('');
    };

    const handleKickStudent = (studentSocketId) => {
        if (!pollId) return;
        if (window.confirm('Are you sure you want to remove this student?')) {
            socketService.socket?.emit('teacher:remove_student', {
                pollId,
                studentSocketId
            });
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 font-sora">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#635BFF] hover:bg-[#5249D6] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                >
                    <MessageSquare size={28} />
                </button>
            )}

            {/* Popup Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-96 h-[500px] flex flex-col border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">

                    {/* Header */}
                    <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                        <div className="flex gap-6">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${activeTab === 'chat'
                                    ? 'border-[#635BFF] text-[#635BFF]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('participants')}
                                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${activeTab === 'participants'
                                    ? 'border-[#635BFF] text-[#635BFF]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Participants
                            </button>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Content */}
                    {activeTab === 'chat' && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.length === 0 && (
                                    <div className="text-center text-gray-400 text-sm mt-10">
                                        No messages yet. Start the conversation!
                                    </div>
                                )}
                                {messages.map((msg, idx) => {
                                    const isMe = msg.socketId === socketService.socket?.id;
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <span className="text-xs text-gray-500 mb-1 px-1">{msg.sender}</span>
                                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${isMe
                                                ? 'bg-[#8F64E1] text-white rounded-br-none'
                                                : 'bg-[#3A3A3B] text-white rounded-bl-none'
                                                }`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="p-2 bg-[#635BFF] text-white rounded-full hover:bg-[#5249D6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* Participants Content */}
                    {activeTab === 'participants' && (
                        <div className="flex-1 overflow-y-auto p-0">
                            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <span>Name</span>
                                {isTeacher && <span>Action</span>}
                            </div>

                            {participants.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No participants yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {participants.map((p) => (
                                        <div key={p.socketId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-[#635BFF] font-bold text-xs">
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{p.name}</span>
                                            </div>

                                            {isTeacher && (
                                                <button
                                                    onClick={() => handleKickStudent(p.socketId)}
                                                    className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                                                >
                                                    Kick out
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatPopup;
