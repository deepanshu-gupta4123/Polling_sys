import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import StudentPage from './pages/StudentPage';
import TeacherPage from './pages/TeacherPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher" element={<TeacherPage />} />
            </Route>

          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

