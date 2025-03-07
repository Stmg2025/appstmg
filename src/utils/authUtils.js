// Función para verificar si hay un token en localStorage
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token; // Convierte a booleano
};

// Función para obtener el token JWT
export const getToken = () => {
    return localStorage.getItem('token');
};

// Función para guardar el token JWT
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

// Función para eliminar el token JWT (logout)
export const removeToken = () => {
    localStorage.removeItem('token');
};

// Función para comprobar si el token está expirado
// Nota: Esta es una implementación simple, puedes mejorarla según tus necesidades
export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiration = payload.exp * 1000; // Convertir a milisegundos
        return Date.now() > expiration;
    } catch (error) {
        return true; // Si hay algún error, asumimos que el token es inválido
    }
};