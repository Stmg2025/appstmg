import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Función para obtener datos del usuario desde el backend
    const fetchUserData = async () => {
        setLoading(true);
        try {
            console.log("🔍 Intentando obtener datos del usuario...");
            const response = await authService.getUserData();
            console.log("✅ Respuesta del servidor:", response.data);

            if (response.data.success && response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("❌ Error obteniendo datos del usuario:", error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    // Comprobar si hay un token al cargar la aplicación
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserData(); // Llamar a la API para obtener datos del usuario
        } else {
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await authService.login(email, password);
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                setIsAuthenticated(true);
                message.success('Inicio de sesión exitoso');
                await fetchUserData(); // Obtener datos después del login
                return true;
            } else {
                message.error(response.data.message || 'Error al iniciar sesión.');
                return false;
            }
        } catch (error) {
            console.error('❌ Error al iniciar sesión:', error);
            message.error('Error al iniciar sesión. Verifica tus credenciales.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        message.success('Sesión cerrada correctamente');
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;