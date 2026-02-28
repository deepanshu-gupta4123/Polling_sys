import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronDown, History, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import ResultsDisplay from '../components/ResultsDisplay';
import ChatPopup from '../components/ChatPopup';

const TeacherPage = () => {
    const { socketService, pollId, setPollId, participantCount, currentQuestion, results, pollHistory } = useSocket();
    const [question, setQuestion] = useState('');
    const [timer, setTimer] = useState(60);
    const [showTimerDropdown, setShowTimerDropdown] = useState(false);
    const [options, setOptions] = useState([
        { id: 1, text: '', isCorrect: true },
        { id: 2, text: '', isCorrect: false }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreatingQuestion, setIsCreatingQuestion] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const pollCreatedRef = useRef(false);

    const timerOptions = [60, 45, 30, 15];

    // Create poll on mount (only once)
    useEffect(() => {
        if (!pollId && !pollCreatedRef.current) {
            pollCreatedRef.current = true;
            socketService.createPoll('Live Poll', 'Real-time classroom poll', (response) => {
                if (response.success) {
                    console.log('Poll created:', response.poll);
                    setPollId(response.poll.id);
                } else {
                    console.error('Failed to create poll');
                    pollCreatedRef.current = false; // Reset on failure
                }
            });
        }
    }, []);

    // Update view state when question starts or ends
    useEffect(() => {
        if (currentQuestion) {
            setIsCreatingQuestion(false);
        } else if (results && !isCreatingQuestion) {
            // Stay on results view
        }
    }, [currentQuestion, results]);

    const handleAddOption = () => {
        const newId = options.length + 1;
        setOptions([...options, { id: newId, text: '', isCorrect: false }]);
    };

    const handleOptionChange = (id, value) => {
        setOptions(options.map(opt =>
            opt.id === id ? { ...opt, text: value } : opt
        ));
    };

    const handleCorrectChange = (id, isCorrect) => {
        setOptions(options.map(opt =>
            opt.id === id ? { ...opt, isCorrect } : opt
        ));
    };

    const handleAskQuestion = () => {
        if (!question.trim() || options.some(opt => !opt.text.trim())) {
            alert('Please fill in the question and all options');
            return;
        }

        if (!pollId) {
            alert('Poll not ready yet, please wait...');
            return;
        }

        setIsSubmitting(true);

        const correctOption = options.find(opt => opt.isCorrect);
        const questionData = {
            text: question,
            options: options.map(opt => ({
                id: opt.id,
                text: opt.text
            })),
            timeLimitSeconds: timer,
            correctOptionId: correctOption?.id
        };

        socketService.startQuestion(pollId, questionData, (response) => {
            setIsSubmitting(false);
            if (response.success) {
                console.log('Question started:', response.question);
                // Reset form
                setQuestion('');
                setOptions([
                    { id: 1, text: '', isCorrect: true },
                    { id: 2, text: '', isCorrect: false }
                ]);
                setIsCreatingQuestion(false);
            } else {
                alert(response.error || 'Failed to start question');
            }
        });
    };

    const handleNewQuestion = () => {
        setIsCreatingQuestion(true);
    };

    // Poll History Modal
    const PollHistoryModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-900">Poll History</h2>
                    <button
                        onClick={() => setShowHistory(false)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-12 bg-gray-50/50">
                    {pollHistory.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            No questions asked yet.
                        </div>
                    ) : (
                        pollHistory.map((historyItem, idx) => (
                            <div key={historyItem.id || idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                                    <span className="font-semibold text-gray-700">Question {idx + 1}</span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${historyItem.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {historyItem.status === 'active' ? 'Active' : 'Closed'}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <ResultsDisplay
                                        results={{
                                            ...historyItem,
                                            totalVotes: historyItem.totalVotes || 0,
                                            options: historyItem.options || []
                                        }}
                                        questionText={historyItem.text}
                                        correctOptionId={historyItem.correctOptionId}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    // If results are available and we are NOT creating a new question, show results
    if (results && !isCreatingQuestion && !currentQuestion) {
        return (
            <div className="min-h-screen font-sora bg-[#FFFFFF] p-8 relative">
                <ChatPopup isTeacher={true} />
                {showHistory && <PollHistoryModal />}

                {/* Top Header */}
                <div className="flex justify-end mb-12">
                    <button
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#8F64E1] text-white rounded-full font-medium hover:bg-[#7a52cc] transition-all shadow-md hover:shadow-lg"
                    >
                        <History size={18} />
                        View Poll history
                    </button>
                </div>

                {/* Main Content - Centered */}
                <div className="max-w-4xl mx-auto">
                    <ResultsDisplay results={results} questionText={results.questionText} correctOptionId={results.correctOptionId} />
                </div>

                {/* Bottom Right Action Button */}
                <div className="fixed  left-[65%] top-[60%] padding-top-10 padding-bottom-10 z-40">
                    <button
                        onClick={handleNewQuestion}
                        className="bg-[#635BFF] px-8 py-3 rounded-full text-base font-medium text-white transition-all duration-300 shadow-lg hover:shadow-[#635BFF]/30 transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <span>+</span> Ask a new question
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sora bg-[#FFFFFF] p-8">
            <ChatPopup isTeacher={true} />
            {showHistory && <PollHistoryModal />}

            <div className="flex flex-col pl-[5%] ">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-2 bg-[linear-gradient(90deg,#7565D9_0%,#4D0ACD_100%)] text-white px-4 py-1.5 rounded-full shadow-sm w-fit">
                        <Sparkles size={16} fill="currentColor" />
                        <span className="text-sm font-semibold tracking-wide">Intervue Poll</span>
                    </div>

                    <button
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#635BFF] text-white rounded-full font-medium hover:bg-[#5249D6] transition-all shadow-md hover:shadow-lg"
                    >
                        <History size={18} />
                        View Poll history
                    </button>
                </div>

                {/* Main Content */}

                <div className="w-[60%]">
                    <h1 className="text-4xl font-medium text-gray-900 mb-4">
                        Let's <span className="font-semibold">Get Started</span>
                    </h1>

                    <p className="text-gray-500 text-base mb-8 leading-relaxed">
                        you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                    </p>

                    {/* Question Input Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-900">
                                Enter your question
                            </label>
                            <div className="relative">
                                <div
                                    onClick={() => setShowTimerDropdown(!showTimerDropdown)}
                                    className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                                >
                                    <span>{timer} seconds</span>
                                    <ChevronDown size={16} className="text-[#635BFF]" />
                                </div>
                                {showTimerDropdown && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        {timerOptions.map((time) => (
                                            <div
                                                key={time}
                                                onClick={() => {
                                                    setTimer(time);
                                                    setShowTimerDropdown(false);
                                                }}
                                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${timer === time ? 'bg-[#635BFF]/10 text-[#635BFF] font-medium' : 'text-gray-700'
                                                    }`}
                                            >
                                                {time} seconds
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Rahul Bajaj"
                                maxLength={100}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all resize-none"
                            />
                            <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {question.length}/100
                            </span>
                        </div>
                    </div>

                    {/* Options Section */}
                    <div className="grid grid-cols-2 gap-8 mb-6">

                        {/* Edit Options Column */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Edit Options</h3>
                            <div className="space-y-3">
                                {options.map((option) => (
                                    <div key={option.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[linear-gradient(243.94deg,#8F64E1_-50.82%,#4E377B_216.33%)] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                            {option.id}
                                        </div>
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                            placeholder="Rahul Bajaj"
                                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all"
                                        />
                                    </div>
                                ))}

                                <button
                                    onClick={handleAddOption}
                                    className="flex items-center gap-2 text-[#635BFF] text-sm font-medium hover:text-[#534be0] transition-colors mt-4"
                                >
                                    <span className="text-lg">+</span>
                                    Add More option
                                </button>
                            </div>
                        </div>

                        {/* Is it Correct Column */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Is it Correct?</h3>
                            <div className="space-y-3">
                                {options.map((option) => (
                                    <div key={option.id} className="h-11 flex items-center gap-6 px-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`correct-${option.id}`}
                                                checked={option.isCorrect}
                                                onChange={() => handleCorrectChange(option.id, true)}
                                                className="w-4 h-4 text-[#635BFF] focus:ring-[#635BFF] accent-[#635BFF]"
                                            />
                                            <span className="text-sm text-gray-700">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`correct-${option.id}`}
                                                checked={!option.isCorrect}
                                                onChange={() => handleCorrectChange(option.id, false)}
                                                className="w-4 h-4 text-gray-400 focus:ring-[#635BFF] accent-[#635BFF]"
                                            />
                                            <span className="text-sm text-gray-700">No</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Ask Question Button */}
                    <div className="flex justify-end mt-16 mb-8">
                        <button
                            onClick={handleAskQuestion}
                            disabled={isSubmitting}
                            className={`
                px-10 py-3 rounded-full text-base font-medium text-white transition-all duration-300 shadow-lg
                ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[linear-gradient(99.18deg,#8F64E1_-46.89%,#1D68BD_223.45%)] hover:shadow-[#635BFF]/30 transform hover:-translate-y-0.5'
                                }
              `}
                        >
                            {isSubmitting ? 'Asking...' : 'Ask Question'}
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default TeacherPage;
