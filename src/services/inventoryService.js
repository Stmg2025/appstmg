import api from '../config/api';
import axios from 'axios';
import { message } from 'antd';

// URL para carga de archivos - DIRECTO hacia el servidor en producción (sin proxy)
const UPLOAD_URL = 'https://stmg.cl/node-server/api/uploads/upload';

console.log('URL de subida de archivos:', UPLOAD_URL);

const inventoryService = {
    // Obtener todo el inventario
    getInventory: async () => {
        try {
            return await api.get('/inventory');
        } catch (error) {
            console.error('Error al obtener inventario:', error);
            throw error;
        }
    },

    // Obtener un elemento del inventario por ID
    getInventoryItemById: async (id) => {
        try {
            return await api.get(`/inventory/${id}`);
        } catch (error) {
            console.error(`Error al obtener item con ID ${id}:`, error);
            throw error;
        }
    },

    // Subir archivo al servidor - MEJORADO
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('archivo', file); // Nombre de campo "archivo" según documentación

        // Imprimir contenido del FormData para debug
        console.log("FormData para subida:", file.name, file.type, file.size);

        try {
            console.log("Iniciando subida a:", UPLOAD_URL);

            // Llamada directa al endpoint de subida
            const response = await axios.post(
                UPLOAD_URL,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log("Respuesta de subida completa:", response);

            // Si la subida fue exitosa, obtenemos la URL de la imagen
            if (response.data && response.data.success) {
                // Extraer la ruta relativa de la imagen
                const fileUrl = response.data.fileInfo.publicPath;

                // Devolver solo lo que necesitamos
                return {
                    data: {
                        success: true,
                        fileUrl: fileUrl
                    }
                };
            } else {
                throw new Error(response.data?.message || 'Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error al subir archivo:', error);

            // Mostrar más detalles del error para depuración
            if (error.response) {
                console.error('Detalles de error del servidor:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Detalles de error de solicitud:', error.request);
            } else {
                console.error('Detalles de error general:', error.message);
            }

            throw error;
        }
    },

    // Crear un nuevo elemento en el inventario
    createInventoryItem: async (itemData) => {
        try {
            console.log("Datos a enviar para creación:", itemData);
            return await api.post('/inventory', itemData);
        } catch (error) {
            console.error('Error al crear item:', error);
            throw error;
        }
    },

    // Actualizar un elemento existente en el inventario
    updateInventoryItem: async (id, itemData) => {
        try {
            console.log("Datos a enviar para actualización:", itemData);
            return await api.put(`/inventory/${id}`, itemData);
        } catch (error) {
            console.error(`Error al actualizar item ${id}:`, error);
            throw error;
        }
    },

    // Eliminar un elemento del inventario
    deleteInventoryItem: async (id) => {
        try {
            return await api.delete(`/inventory/${id}`);
        } catch (error) {
            console.error(`Error al eliminar item ${id}:`, error);
            throw error;
        }
    }
};

export default inventoryService;