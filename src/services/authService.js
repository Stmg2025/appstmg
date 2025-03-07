import axios from 'axios';

const API_URL = "http://localhost:5173/api"; // Verifica que esta URL sea la correcta

const authService = {
    login: (email, password) => axios.post(`${API_URL}/auth/login`, { email, password }),

    getUserData: () =>
        axios.get(`${API_URL}/auth/user`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
};

export default authService;
