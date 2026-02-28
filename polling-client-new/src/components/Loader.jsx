import React from 'react';
import { Sparkles } from 'lucide-react';

const Loader = ({ message = "Loading..." }) => {
    return (
        <div className="min-h-screen font-sora bg-[#FFFFFF] flex flex-col items-center justify-center p-4">

            {/* Header Badge */}
            <div className="flex items-center gap-2 bg-[linear-gradient(90deg,#7565D9_0%,#4D0ACD_100%)] text-white px-4 py-1.5 rounded-full shadow-sm mb-12">
                <Sparkles size={16} fill="currentColor" />
                <span className="text-sm font-semibold tracking-wide">Intervue Poll</span>
            </div>

            {/* Spinner */}
            <div className="mb-8">
                <div className="w-16 h-16 border-[6px] border-transparent border-t-[6px] border-t-[#635BFF] border-r-[6px] border-r-[#635BFF] rounded-full animate-spin"></div>
            </div>

            {/* Message */}
            <p className="text-gray-900 text-[27px] font-semibold text-center">
                {message}
            </p>

        </div>
    );
};

export default Loader;
