import api from '../config/api';

const authService = {
    // Usar la instancia de api configurada para detectar automáticamente el entorno
    login: (email, password) => api.post('/auth/login', { email, password }),

    // Ya no necesitamos añadir el token manualmente, el interceptor en api.js lo hace
    getUserData: () => api.get('/auth/user')
};

export default authService;