import api from '../config/api';

/**
 * Servicio para la gestión de clientes
 * Proporciona funciones para interactuar con la API de clientes
 */
const clienteService = {
    /**
     * Método auxiliar para manejar errores en las peticiones
     * @param {Error} error - Error capturado
     * @param {string} operacion - Nombre de la operación donde ocurrió el error
     * @param {Object} defaultData - Datos por defecto a devolver en caso de error
     * @returns {Object} Respuesta formateada con el error
     */
    handleError(error, operacion, defaultData = {}) {
        // Capturar detalles del error
        const errorMsg = error.response?.data?.message || error.message || `Error al ${operacion}`;
        console.error(`Error en ${operacion}:`, error);

        // Devolver respuesta estructurada
        return {
            data: {
                success: false,
                message: errorMsg,
                ...defaultData
            }
        };
    },

    /**
     * Construye query params a partir de un objeto de filtros
     * @param {Object} params - Objeto con los parámetros a convertir
     * @returns {string} String con formato de query params
     */
    buildQueryParams(params) {
        return Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== '')
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
    },

    /**
     * Obtiene todos los clientes con paginación opcional
     * @param {number} page - Número de página
     * @param {number} limit - Límite de resultados por página
     * @param {boolean} all - Indica si se deben obtener todos los registros
     * @returns {Promise<Object>} Promesa con los datos de clientes
     */
    async getAllClientes(page = 1, limit = 10, all = false) {
        try {
            const queryParams = this.buildQueryParams({ page, limit, all });
            const response = await api.get(`/clientes?${queryParams}`);

            // Solo loguear en desarrollo
            if (process.env.NODE_ENV !== 'production') {
                console.log('getAllClientes - Respuesta:', response?.data?.clientes?.length || 0, 'clientes');
            }

            return response.data || { success: false, clientes: [] };
        } catch (error) {
            return this.handleError(error, 'obtener clientes', { clientes: [] });
        }
    },

    /**
     * Obtiene un cliente específico por su código auxiliar
     * @param {string} codaux - Código auxiliar del cliente
     * @returns {Promise<Object>} Promesa con los datos del cliente
     */
    async getClienteById(codaux) {
        try {
            const response = await api.get(`/clientes/${codaux}`);

            if (process.env.NODE_ENV !== 'production') {
                console.log(`getClienteById - Cliente ${codaux} obtenido:`, response?.data?.success);
            }

            return response.data || { success: false, cliente: null };
        } catch (error) {
            return this.handleError(error, 'obtener el cliente', { cliente: null });
        }
    },

    /**
     * Crea un nuevo cliente
     * @param {Object} clienteData - Datos del cliente a crear
     * @returns {Promise<Object>} Promesa con el resultado de la operación
     */
    async createCliente(clienteData) {
        try {
            const response = await api.post('/clientes', clienteData);

            if (process.env.NODE_ENV !== 'production') {
                console.log('createCliente - Respuesta:', response?.data?.success);
            }

            return response.data || { success: false };
        } catch (error) {
            return this.handleError(error, 'crear el cliente');
        }
    },

    /**
     * Actualiza un cliente existente
     * @param {string} codaux - Código auxiliar del cliente
     * @param {Object} clienteData - Nuevos datos del cliente
     * @returns {Promise<Object>} Promesa con el resultado de la operación
     */
    async updateCliente(codaux, clienteData) {
        try {
            if (process.env.NODE_ENV !== 'production') {
                console.log(`updateCliente - Actualizando cliente ${codaux}`);
            }

            const response = await api.put(`/clientes/${codaux}`, clienteData);

            if (process.env.NODE_ENV !== 'production') {
                console.log('updateCliente - Respuesta:', response?.data?.success);
            }

            return response.data || { success: false };
        } catch (error) {
            return this.handleError(error, 'actualizar el cliente');
        }
    },

    /**
     * Elimina un cliente
     * @param {string} codaux - Código auxiliar del cliente a eliminar
     * @returns {Promise<Object>} Promesa con el resultado de la operación
     */
    async deleteCliente(codaux) {
        try {
            const response = await api.delete(`/clientes/${codaux}`);

            if (process.env.NODE_ENV !== 'production') {
                console.log(`deleteCliente - Cliente ${codaux} eliminado:`, response?.data?.success);
            }

            return response.data || { success: false };
        } catch (error) {
            return this.handleError(error, 'eliminar el cliente');
        }
    },

    /**
     * Busca clientes aplicando filtros
     * @param {Object} filters - Filtros a aplicar en la búsqueda
     * @returns {Promise<Object>} Promesa con los resultados de búsqueda
     */
    async searchClientes(filters = {}) {
        try {
            const queryParams = this.buildQueryParams(filters);
            const response = await api.get(`/clientes/search?${queryParams}`);

            if (process.env.NODE_ENV !== 'production') {
                console.log('searchClientes - Resultados:', response?.data?.clientes?.length || 0);
            }

            return response.data || { success: false, clientes: [] };
        } catch (error) {
            return this.handleError(error, 'buscar clientes', { clientes: [] });
        }
    }
};

export default clienteService;