import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { UserRole } from '../constants/roles';

const LandingPage = () => {
    const [selectedRole, setSelectedRole] = useState(UserRole.STUDENT);
    const navigate = useNavigate();

    const handleContinue = () => {
        if (selectedRole === UserRole.STUDENT) navigate('/student');
        if (selectedRole === UserRole.TEACHER) navigate('/teacher');
    };

    return (
        <div className="min-h-screen flex flex-col items-center font-sora justify-center bg-[#FFFFFF] p-4">

            {/* Header Badge */}
            <div className="flex items-center gap-2 bg-[linear-gradient(90deg,#7565D9_0%,#4D0ACD_100%)] text-white px-4 py-1.5 rounded-full shadow-sm mb-8 animate-fade-in-down">
                <Sparkles size={16} fill="currentColor" />
                <span className="text-sm font-semibold tracking-wide">Intervue Poll</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 text-center mb-4 tracking-tight">
                Welcome to the <span className="font-bold">Live Polling System</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-500 text-lg text-center max-w-2xl mb-12 leading-relaxed">
                Please select the role that best describes you to begin using the live polling system
            </p>

            {/* Cards Container */}
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center mb-12">

                {/* Student Card */}
                <div
                    onClick={() => setSelectedRole(UserRole.STUDENT)}
                    className={`
            relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 w-full md:w-80
            flex flex-col
            
            ${selectedRole === UserRole.STUDENT
                            ? 'border-[#635BFF] '
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }
          `}
                >
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">I'm a Student</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry
                    </p>
                </div>

                {/* Teacher Card */}
                <div
                    onClick={() => setSelectedRole(UserRole.TEACHER)}
                    className={`
            relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 w-full md:w-80
            flex flex-col
            ${selectedRole === UserRole.TEACHER
                            ? 'border-[#635BFF] '
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }
          `}
                >
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">I'm a Teacher</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Submit answers and view live poll results in real-time.
                    </p>
                </div>

            </div>

            {/* Continue Button */}
            <button
                onClick={handleContinue}
                disabled={!selectedRole}
                className={`
                    bg-[linear-gradient(99.18deg,#8F64E1_-46.89%,#1D68BD_223.45%)]
          px-16 py-4 rounded-full text-lg font-semibold text-white transition-all duration-300 shadow-lg
          ${selectedRole
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

export default LandingPage;
