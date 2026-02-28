import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/Loader';
import QuestionDisplay from '../components/QuestionDisplay';
import ChatPopup from '../components/ChatPopup';

const StudentPage = () => {
    const { socketService, pollId, setPollId, currentQuestion } = useSocket();
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [currentQuestionId, setCurrentQuestionId] = useState(null);

    // Listen for new questions
    useEffect(() => {
        if (currentQuestion) {
            setCurrentQuestionId(currentQuestion.id);
            setIsSubmitted(false);
        }
    }, [currentQuestion]);

    const handleContinue = () => {
        if (name.trim()) {
            setJoined(true); // Show loader immediately
            socketService.joinAnyPoll(name, (response) => {
                if (response.success) {
                    console.log('Joined poll:', response.poll);
                    setPollId(response.poll.id);
                } else {
                    console.error('No poll available:', response.error);
                    // Keep showing loader with message
                }
            });
        }
    };

    const handleSubmitAnswer = (optionId) => {
        if (!pollId || !currentQuestionId) return;

        socketService.submitAnswer(pollId, currentQuestionId, optionId, (response) => {
            if (response.success) {
                console.log('Answer submitted successfully');
                setIsSubmitted(true);
            } else {
                alert(response.error || 'Failed to submit answer');
            }
        });
    };

    // If question is active - show question
    if (joined && currentQuestion) {
        return (
            <>
                <ChatPopup isTeacher={false} />
                <QuestionDisplay
                    question={currentQuestion}
                    onSubmit={handleSubmitAnswer}
                    isSubmitted={isSubmitted}
                />
            </>
        );
    }

    // If joined but waiting (submitted answer or no question) - show loader
    if (joined) {
        return (
            <>
                <ChatPopup isTeacher={false} />
                <Loader message="Wait for the teacher to ask questions.." />
            </>
        );
    }

    // Entry screen
    return (
        <div className="min-h-screen font-sora flex flex-col items-center justify-center bg-[#FFFFFF] p-4">

            {/* Header Badge */}
            <div className="flex items-center gap-2 bg-[linear-gradient(90deg,#7565D9_0%,#4D0ACD_100%)] text-white px-4 py-1.5 rounded-full shadow-sm mb-8">
                <Sparkles size={16} fill="currentColor" />
                <span className="text-sm font-semibold tracking-wide">Intervue Poll</span>
            </div>

            {/* Main Content */}
            <div className="w-[55%]">
                <h1 className="text-4xl font-semibold text-gray-900 text-center mb-4">
                    Let's <span className="font-bold">Get Started</span>
                </h1>

                <p className="w-[80%] mx-auto text-gray-500 text-lg text-center mb-8 leading-relaxed">
                    If you're a student, you'll be able to <span className="font-semibold text-gray-900">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
                </p>

                {/* Input Container */}
                <div className="w-[55%] mb-8 translate-x-[40%]">
                    <label className="block text-medium font-2xsm text-gray-900 mb-2">
                        Enter your Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                        placeholder="Name"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:border-transparent transition-all"
                    />
                </div>

            </div>

            {/* Continue Button */}
            <button
                onClick={handleContinue}
                disabled={!name.trim()}
                className={`
          bg-[linear-gradient(99.18deg,#8F64E1_-46.89%,#1D68BD_223.45%)]
          px-16 py-4 rounded-full text-lg font-semibold text-white transition-all duration-300 shadow-lg right-[50%]  
          ${name.trim()
                        ? 'bg-[#635BFF] hover:bg-[linear-gradient(99.18deg,#8F64E1_-46.89%,#1D68BD_223.45%)] hover:shadow-[#635BFF]/30 transform hover:-translate-y-0.5'
                        : 'bg-gray-300 cursor-not-allowed'
                    }
        `}
            >
                Continue
            </button>

        </div>
    );
};

export default StudentPage;
