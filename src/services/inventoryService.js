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

    // Crear un nuevo elemento en el inventario
    createInventoryItem: async (itemData) => {
        return await api.post('/inventory', itemData);
    },

    // Actualizar un elemento existente en el inventario
    updateInventoryItem: async (id, itemData) => {
        return await api.put(`/inventory/${id}`, itemData);
    },

    // Eliminar un elemento del inventario
    deleteInventoryItem: async (id) => {
        return await api.delete(`/inventory/${id}`);
    }
};

export default inventoryService;