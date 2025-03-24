import api from '../config/api';

const solicitudService = {
    // Obtener todas las solicitudes con paginación opcional
    getAllSolicitudes: async (page = 1, limit = 10, all = false) => {
        try {
            const response = await api.get(`/solicitudes?page=${page}&limit=${limit}&all=${all}`);
            return response;
        } catch (error) {
            console.error('Error en getAllSolicitudes:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener solicitudes',
                    solicitudes: []
                }
            };
        }
    },

    // Obtener una solicitud específica por ID
    getSolicitudById: async (id) => {
        try {
            const response = await api.get(`/solicitudes/${id}`);
            return response;
        } catch (error) {
            console.error('Error en getSolicitudById:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener la solicitud',
                    solicitud: null
                }
            };
        }
    },

    // Crear una nueva solicitud
    createSolicitud: async (solicitudData) => {
        try {
            const response = await api.post('/solicitudes', solicitudData);
            return response;
        } catch (error) {
            console.error('Error en createSolicitud:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al crear la solicitud'
                }
            };
        }
    },

    // Actualizar una solicitud existente
    updateSolicitud: async (id, solicitudData) => {
        try {
            const response = await api.put(`/solicitudes/${id}`, solicitudData);
            return response;
        } catch (error) {
            console.error('Error en updateSolicitud:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al actualizar la solicitud'
                }
            };
        }
    },

    // Eliminar una solicitud
    deleteSolicitud: async (id) => {
        try {
            const response = await api.delete(`/solicitudes/${id}`);
            return response;
        } catch (error) {
            console.error('Error en deleteSolicitud:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al eliminar la solicitud'
                }
            };
        }
    },

    // Buscar solicitudes con filtros (incluye soporte para búsqueda global)
    searchSolicitudes: async (filters = {}) => {
        try {
            // Construir la URL con los filtros
            let queryParams = Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== '')
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');

            const response = await api.get(`/solicitudes/search?${queryParams}`);
            return response;
        } catch (error) {
            console.error('Error en searchSolicitudes:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al buscar solicitudes',
                    solicitudes: []
                }
            };
        }
    },

    // Obtener estadísticas de solicitudes
    getSolicitudesStats: async () => {
        try {
            const response = await api.get('/solicitudes/stats');
            return response;
        } catch (error) {
            console.error('Error en getSolicitudesStats:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener estadísticas',
                    stats: {}
                }
            };
        }
    }
};

export default solicitudService;