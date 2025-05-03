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
    },

    // Obtener solicitudes por técnico asignado
    getSolicitudesByTecnico: async (tecnicoId) => {
        try {
            const response = await api.get(`/solicitudes/tecnico/${tecnicoId}`);
            return response;
        } catch (error) {
            console.error('Error en getSolicitudesByTecnico:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener solicitudes por técnico',
                    solicitudes: []
                }
            };
        }
    },

    // Obtener solicitudes por prioridad
    getSolicitudesByPrioridad: async (prioridad) => {
        try {
            const response = await api.get(`/solicitudes/prioridad/${prioridad}`);
            return response;
        } catch (error) {
            console.error('Error en getSolicitudesByPrioridad:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener solicitudes por prioridad',
                    solicitudes: []
                }
            };
        }
    },

    // Buscar solicitudes por rango de fecha de agendamiento
    searchByFechaAgendamiento: async (fechaDesde, fechaHasta) => {
        try {
            const filters = {
                fecha_agendamiento_desde: fechaDesde,
                fecha_agendamiento_hasta: fechaHasta
            };

            let queryParams = Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== '')
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');

            const response = await api.get(`/solicitudes/search?${queryParams}`);
            return response;
        } catch (error) {
            console.error('Error en searchByFechaAgendamiento:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al buscar solicitudes por fecha de agendamiento',
                    solicitudes: []
                }
            };
        }
    },

    // Funciones de ayuda para filtros comunes

    // Filtrar por tipo de cliente
    getByTipoCliente: async (tipoCliente) => {
        return await solicitudService.searchSolicitudes({ tipo_cliente: tipoCliente });
    },

    // Filtrar por facturable
    getByFacturable: async (facturable) => {
        return await solicitudService.searchSolicitudes({ facturable });
    },

    // Filtrar por ejecución
    getByEjecucion: async (ejecucion) => {
        return await solicitudService.searchSolicitudes({ ejecucion });
    },

    // Actualizar estado de solicitud
    updateEstado: async (id, estado, motivo_estado = null) => {
        const data = {
            estado,
            fecha_estado: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        if (motivo_estado) {
            data.motivo_estado = motivo_estado;
        }

        return await solicitudService.updateSolicitud(id, data);
    },

    // Asignar técnico a solicitud
    asignarTecnico: async (id, tecnico_asignado) => {
        return await solicitudService.updateSolicitud(id, { tecnico_asignado });
    },

    // Establecer fecha de agendamiento
    agendar: async (id, fecha_agendamiento) => {
        return await solicitudService.updateSolicitud(id, { fecha_agendamiento });
    },

    // Cerrar solicitud
    cerrarSolicitud: async (id, tecnico_cierre, motivo_estado = null) => {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const data = {
            estado: 'Cerrada',
            fec_cierre: now,
            fec_real_cierre: now,
            tecnico_cierre,
            fecha_estado: now
        };

        if (motivo_estado) {
            data.motivo_estado = motivo_estado;
        }

        return await solicitudService.updateSolicitud(id, data);
    }
};

export default solicitudService;