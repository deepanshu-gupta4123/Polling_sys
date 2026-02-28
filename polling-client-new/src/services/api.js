import axios from 'axios';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
