import axios from 'axios';

// Detectar si estamos en desarrollo o producción de manera más confiable
const isProduction =
    window.location.hostname === 'app.stmg.cl' ||
    window.location.hostname === 'stmg.cl' ||
    !['localhost', '127.0.0.1', ''].includes(window.location.hostname);

// URL base dependiendo del entorno
const API_URL = isProduction
    ? 'https://stmg.cl/node-server/api' // URL directa en producción
    : '/api';  // Usar proxy en desarrollo

console.log('Entorno de API:', isProduction ? 'Producción' : 'Desarrollo');
console.log('URL base de API:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Aumentamos el timeout para dar más tiempo al servidor
    timeout: 15000, // 15 segundos
});

// Interceptor para añadir el token JWT a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Detectar si estamos enviando FormData y ajustar los encabezados
        if (config.data instanceof FormData) {
            // Eliminar el Content-Type para que axios lo establezca con el boundary correcto
            delete config.headers['Content-Type'];
            // Log para depuración
            console.log('Enviando FormData:', config.url);
        }

        // Depuración: Imprimir URL completa que se está utilizando
        console.log(`Enviando petición a: ${config.baseURL + config.url}`);

        return config;
    },
    (error) => {
        console.error('Error en interceptor de petición:', error);
        return Promise.reject(error);
    }
);

// Variable para controlar reintento de peticiones
const MAX_RETRIES = 2;
const retryDelay = 1000; // 1 segundo entre reintentos
const pendingRetries = new Map();

// Interceptor para manejar respuestas
api.interceptors.response.use(
    (response) => {
        // Resetear contador de reintentos para esta URL si existe
        if (pendingRetries.has(response.config.url)) {
            pendingRetries.delete(response.config.url);
        }
        return response;
    },
    async (error) => {
        const { config } = error;

        // Si no hay configuración o es un cancelación, no reintentar
        if (!config || error.message === 'canceled') {
            return Promise.reject(error);
        }

        // Obtener el número de reintentos para esta URL o inicializar
        const url = config.url;
        const retryCount = pendingRetries.get(url) || 0;

        // Verificar si es un error 503 (servidor no disponible) y podemos reintentar
        if (error.response && (error.response.status === 503 || error.response.status === 502) && retryCount < MAX_RETRIES) {
            pendingRetries.set(url, retryCount + 1);

            console.log(`Reintentando petición (${retryCount + 1}/${MAX_RETRIES}): ${url}`);

            // Esperar antes de reintentar
            await new Promise(resolve => setTimeout(resolve, retryDelay));

            // Reintentar la petición
            return api(config);
        }

        // Manejo mejorado de errores
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            console.error('Error de respuesta:', error.response.status, error.response.data);

            if (error.response.status === 401) {
                console.log('Sesión expirada o no autorizado');
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (error.response.status === 503 || error.response.status === 502) {
                console.error('Servidor temporalmente no disponible');
                // Mostrar mensaje amigable al usuario (puedes implementar un sistema de notificaciones)
            } else if (error.response.status === 413) {
                console.error('Archivo demasiado grande para el servidor');
            }
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error('No se recibió respuesta del servidor:', error.request);
        } else {
            // Algo ocurrió al configurar la petición
            console.error('Error al configurar la petición:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;