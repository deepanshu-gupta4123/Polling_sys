import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

const ResultsDisplay = ({ results, questionText, correctOptionId }) => {
    const maxVotes = Math.max(...results.options.map(opt => opt.votes));

    return (
        <div className="w-full font-sora">
            <div className="w-full">

                {/* Question Header */}
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Question</h2>
                </div>

                {/* Question Box */}
                <div className="text-white px-8 py-4 rounded-t-xl mb-0" style={{ background: 'linear-gradient(90deg, #343434 0%, #6E6E6E 100%)' }}>
                    <h2 className="text-xl font-semibold">{questionText || "Question"}</h2>
                </div>

                {/* Options Container */}
                <div className="border border-[#8F64E1] border-t-0 rounded-b-xl p-6 space-y-4 bg-white shadow-sm">
                    {results.options.map((option, index) => {
                        const isCorrect = correctOptionId && option.id === correctOptionId;
                        const totalVotes = results.totalVotes || 0;
                        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

                        // Handle multiple levels of nesting for option text
                        let optionText = 'Option ' + (index + 1);

                        if (typeof option.text === 'string') {
                            optionText = option.text;
                        } else if (option.text && typeof option.text === 'object') {
                            const textObj = option.text;
                            optionText = textObj.text || textObj.value || JSON.stringify(textObj);
                        }

                        const optionId = option?.id ?? index;
                        const uniqueKey = `result-${optionId}-${index}`;

                        // Text color based on bar width (approximate threshold)
                        const textColor = percentage > 25 ? 'text-white' : 'text-gray-900';
                        const circleColor = percentage > 25 ? 'text-[#6766D5] bg-white' : 'text-white bg-[#635BFF]';

                        return (
                            <div key={uniqueKey} className={`relative w-full h-16 rounded-lg overflow-hidden bg-gray-50 border ${isCorrect ? 'border-[#8F64E1] border-2' : 'border-gray-100'}`}>
                                {/* Progress Bar Background */}
                                <div
                                    className="absolute top-0 left-0 h-full bg-[#635BFF] transition-all duration-1000 ease-out"
                                    style={{ width: `${percentage}%` }}
                                />

                                {/* Content */}
                                <div className="relative h-full px-6 flex items-center justify-between z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                                            ${circleColor}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <span className={`text-lg font-medium ${textColor}`}>{String(optionText)}</span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold text-lg ${percentage > 90 ? 'text-white' : 'text-gray-900'}`}>
                                            {Math.round(percentage)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default ResultsDisplay;
