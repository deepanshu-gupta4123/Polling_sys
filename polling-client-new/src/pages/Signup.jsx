import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, KeyRound, Mail, User, GraduationCap, School, Loader2 } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [isLoading, setIsLoading] = useState(false);
    const { register, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await register(name, email, password, role);
            if (user.role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        } catch (err) {
            // Error handled in context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-indigo-500"></div>

                <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Home
                </Link>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Create Account</h2>
                    <p className="text-gray-500 mt-2">Join us and start polling today</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                        <div className="relative">
                            <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                placeholder="Create a strong password"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${role === 'student'
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-100 hover:border-indigo-100 text-gray-500'
                                    }`}
                            >
                                <GraduationCap className={`w-6 h-6 mb-2 ${role === 'student' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className="font-medium">Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('teacher')}
                                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${role === 'teacher'
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-100 hover:border-indigo-100 text-gray-500'
                                    }`}
                            >
                                <School className={`w-6 h-6 mb-2 ${role === 'teacher' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className="font-medium">Teacher</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
