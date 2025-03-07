import api from '../config/api';

const userService = {
    // Obtener todos los usuarios
    getUsers: async () => {
        return await api.get('/users');
    },

    // Obtener un usuario por ID
    getUserById: async (id) => {
        return await api.get(`/users/${id}`);
    },

    // Crear un nuevo usuario
    createUser: async (userData) => {
        return await api.post('/users', userData);
    },

    // Actualizar un usuario existente
    updateUser: async (id, userData) => {
        return await api.put(`/users/${id}`, userData);
    },

    // Eliminar un usuario
    deleteUser: async (id) => {
        return await api.delete(`/users/${id}`);
    }
};

export default userService;