import api from '../config/api';

const roleService = {
    // Obtener todos los roles
    getRoles: async () => {
        return await api.get('/roles');
    },

    // Obtener un rol por ID
    getRoleById: async (id) => {
        return await api.get(`/roles/${id}`);
    },

    // Crear un nuevo rol
    createRole: async (roleData) => {
        return await api.post('/roles', roleData);
    },

    // Actualizar un rol existente
    updateRole: async (id, roleData) => {
        return await api.put(`/roles/${id}`, roleData);
    },

    // Eliminar un rol
    deleteRole: async (id) => {
        return await api.delete(`/roles/${id}`);
    }
};

export default roleService;