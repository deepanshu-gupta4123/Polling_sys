import api from './api';

const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

const login = async (userData) => {
    const response = await api.post('/auth/login', userData);
    return response.data;
};

const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    getMe,
};

export default authService;
