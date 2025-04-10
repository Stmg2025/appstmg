import axios from 'axios';

// Determinar el entorno
const isDevelopment = process.env.NODE_ENV === 'development';

// URL base según el entorno
const baseURL = isDevelopment
    ? '/api' // En desarrollo, usa proxy
    : 'https://stmg.cl/node-server/api'; // En producción, usa la URL completa

console.log('Entorno de API:', isDevelopment ? 'Desarrollo' : 'Producción');
console.log('URL base de API:', baseURL);

// Crear instancia de axios con la URL base
const api = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token JWT a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Registra la petición para debug
        if (isDevelopment) {
            console.log(`Enviando petición a: ${config.url}`);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
    (response) => {
        // Procesar respuesta exitosa
        return response;
    },
    (error) => {
        // Manejar error de respuesta
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            console.error(`Error de respuesta: ${error.response.status}`, error.response.data);

            // Si recibimos un 401 (Unauthorized), significa que el token expiró
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                // Redirigir al login - esto se hará desde el componente que use la API
            }
        } else if (error.request) {
            // La petición se realizó pero no se recibió respuesta
            console.error('Error de solicitud sin respuesta:', error.request);
        } else {
            // Ocurrió un error al configurar la petición
            console.error('Error en la configuración de la petición:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;