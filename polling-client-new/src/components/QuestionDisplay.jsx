import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

const QuestionDisplay = ({ question, onSubmit, isSubmitted }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(question.timeLimitSeconds);

    useEffect(() => {
        setTimeRemaining(question.timeLimitSeconds);
        setSelectedOption(null);

        const startTime = new Date(question.startedAt).getTime();
        const endTime = startTime + (question.timeLimitSeconds * 1000);

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeRemaining(remaining);

            if (remaining === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [question]);

    const handleSubmit = () => {
        if (selectedOption !== null && !isSubmitted) {
            onSubmit(selectedOption);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen font-sora bg-[#FFFFFF] flex flex-col items-center justify-center p-8">
            <div className="max-w-3xl w-full">

                {/* Header with Question Number and Timer */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">Question 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 text-xl font-bold ${timeRemaining <= 10 ? 'text-red-500' : 'text-red-500'}`}>
                            <Clock size={24} />
                            <span>{formatTime(timeRemaining)}</span>
                        </div>
                    </div>
                </div>

                {/* Question Box */}
                <div className="text-white height-[50px] px-8 py-4 rounded-t-xl mb-0" style={{ background: 'linear-gradient(90deg, #343434 0%, #6E6E6E 100%)' }}>
                    <h2 className="text-xl font-semibold">{question.text}</h2>
                </div>

                {/* Options Container */}
                <div className="border-2 border-[#AF8FF1] border-x-[#AF8FF1] border-b-[#AF8FF1] border-t-0 rounded-b-xl p-8 space-y-4">
                    {question.options && Array.isArray(question.options) && question.options.map((option, index) => {
                        // Handle multiple levels of nesting for option text
                        let optionText = 'Option ' + (index + 1);

                        if (typeof option === 'string') {
                            optionText = option;
                        } else if (option && typeof option === 'object') {
                            // Try to extract text from nested structure
                            if (typeof option.text === 'string') {
                                optionText = option.text;
                            } else if (option.text && typeof option.text === 'object') {
                                // Handle deeply nested text object - stringify it
                                const textObj = option.text;
                                optionText = textObj.text || textObj.value || JSON.stringify(textObj);
                            }
                        }

                        // Use a combination of option.id and index for truly unique keys
                        const optionId = option?.id ?? index;
                        const uniqueKey = `option-${optionId}-${index}`;

                        return (
                            <button
                                key={uniqueKey}
                                onClick={() => !isSubmitted && setSelectedOption(optionId)}
                                disabled={isSubmitted}
                                className={`
                  w-full px-6 py-4 rounded-lg text-left text-lg font-medium transition-all duration-200 flex items-center gap-4
                  ${selectedOption === optionId
                                        ? 'bg-white border-2 border-[#635BFF] text-gray-900'
                                        : 'bg-[#F7FAFC] border-2 border-transparent text-gray-700 hover:bg-gray-100'
                                    }
                  ${isSubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                `}
                            >
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                  ${selectedOption === optionId
                                        ? 'bg-[#635BFF] text-white border-2 border-[#8F64E1]'
                                        : 'bg-[#9CA3AF] text-white'
                                    }
                `}>
                                    {index + 1}
                                </div>
                                <span>{String(optionText)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Submit Button */}
                {!isSubmitted && (
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={selectedOption === null || timeRemaining === 0}
                            className={`
                px-16 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg
                ${selectedOption !== null && timeRemaining > 0
                                    ? 'bg-[linear-gradient(99.18deg,#8F64E1_-46.89%,#1D68BD_223.45%)] text-white hover:shadow-[#635BFF]/30'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }
              `}
                        >
                            Submit
                        </button>
                    </div>
                )}

                {isSubmitted && (
                    <div className="text-center mt-8">
                        <div className="inline-flex items-center gap-2 text-green-600 text-lg font-semibold">
                            <CheckCircle size={24} />
                            Answer Submitted!
                        </div>
                        <p className="text-gray-500 mt-2">Waiting for others to finish...</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default QuestionDisplay;
