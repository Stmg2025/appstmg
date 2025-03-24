import api from '../config/api';

const estadoSolicitudService = {
    // Obtener todos los estados
    getEstados: async () => {
        return await api.get('/estado-solicitud');
    },

    // Obtener un estado por ID
    getEstadoById: async (id) => {
        return await api.get(`/estado-solicitud/${id}`);
    },

    // Crear un nuevo estado
    createEstado: async (data) => {
        return await api.post('/estado-solicitud', data);
    },

    // Actualizar un estado existente
    updateEstado: async (id, data) => {
        return await api.put(`/estado-solicitud/${id}`, data);
    },

    // Eliminar un estado
    deleteEstado: async (id) => {
        return await api.delete(`/estado-solicitud/${id}`);
    }
};

export default estadoSolicitudService;