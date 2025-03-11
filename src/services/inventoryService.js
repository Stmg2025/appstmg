import api from '../config/api';

const inventoryService = {
    // Obtener todo el inventario
    getInventory: async () => {
        return await api.get('/inventory');
    },

    // Obtener un elemento del inventario por ID
    getInventoryItemById: async (id) => {
        return await api.get(`/inventory/${id}`);
    },

    // Crear un nuevo elemento en el inventario con soporte para archivos
    createInventoryItem: async (itemData) => {
        // Verificar si estamos recibiendo FormData (para imágenes) o datos regulares
        const headers = itemData instanceof FormData ?
            { 'Content-Type': 'multipart/form-data' } :
            {};

        return await api.post('/inventory', itemData, { headers });
    },

    // Actualizar un elemento existente en el inventario con soporte para archivos
    updateInventoryItem: async (id, itemData) => {
        // Verificar si estamos recibiendo FormData (para imágenes) o datos regulares
        const headers = itemData instanceof FormData ?
            { 'Content-Type': 'multipart/form-data' } :
            {};

        return await api.put(`/inventory/${id}`, itemData, { headers });
    },

    // Eliminar un elemento del inventario
    deleteInventoryItem: async (id) => {
        return await api.delete(`/inventory/${id}`);
    }
};

export default inventoryService;