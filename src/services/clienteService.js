import api from '../config/api';

const clienteService = {
    // Obtener todos los clientes con paginación opcional
    getAllClientes: async (page = 1, limit = 10, all = false) => {
        try {
            const response = await api.get(`/clientes?page=${page}&limit=${limit}&all=${all}`);
            console.log('Respuesta getAllClientes:', response);
            return response;
        } catch (error) {
            console.error('Error en getAllClientes:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener clientes',
                    clientes: []
                }
            };
        }
    },

    // Obtener un cliente específico por código auxiliar
    getClienteById: async (codaux) => {
        try {
            const response = await api.get(`/clientes/${codaux}`);
            console.log('Respuesta getClienteById:', response);
            return response;
        } catch (error) {
            console.error('Error en getClienteById:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener el cliente',
                    cliente: null
                }
            };
        }
    },

    // Crear un nuevo cliente
    createCliente: async (clienteData) => {
        try {
            const response = await api.post('/clientes', clienteData);
            console.log('Respuesta createCliente:', response);
            return response;
        } catch (error) {
            console.error('Error en createCliente:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al crear el cliente'
                }
            };
        }
    },

    // Actualizar un cliente existente
    updateCliente: async (codaux, clienteData) => {
        try {
            console.log(`Enviando actualización a: /clientes/${codaux}`, clienteData);
            const response = await api.put(`/clientes/${codaux}`, clienteData);
            console.log('Respuesta updateCliente:', response);
            return response;
        } catch (error) {
            console.error('Error en updateCliente:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al actualizar el cliente'
                }
            };
        }
    },

    // Eliminar un cliente
    deleteCliente: async (codaux) => {
        try {
            const response = await api.delete(`/clientes/${codaux}`);
            console.log('Respuesta deleteCliente:', response);
            return response;
        } catch (error) {
            console.error('Error en deleteCliente:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al eliminar el cliente'
                }
            };
        }
    },

    // Buscar clientes con filtros (incluye soporte para búsqueda global)
    searchClientes: async (filters = {}) => {
        try {
            // Construir la URL con los filtros
            let queryParams = Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== '')
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');

            const response = await api.get(`/clientes/search?${queryParams}`);
            console.log('Respuesta searchClientes:', response);
            return response;
        } catch (error) {
            console.error('Error en searchClientes:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al buscar clientes',
                    clientes: []
                }
            };
        }
    }
};

export default clienteService;