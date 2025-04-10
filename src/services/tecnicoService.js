import api from '../config/api';

const tecnicoService = {
    // Obtener todos los técnicos
    getTecnicos: async () => {
        try {
            const response = await api.get('/tecnicos');
            return response;
        } catch (error) {
            console.error('Error al obtener técnicos:', error);
            // Devolver una respuesta "vacía" pero válida para que la UI no falle
            return {
                data: {
                    success: false,
                    tecnicos: [],
                    message: 'No se pudieron cargar los técnicos'
                }
            };
        }
    },

    // Obtener un técnico por ID
    getTecnicoById: async (id) => {
        try {
            const response = await api.get(`/tecnicos/${id}`);
            return response;
        } catch (error) {
            console.error(`Error al obtener técnico ${id}:`, error);
            return {
                data: {
                    success: false,
                    tecnico: null,
                    message: 'No se pudo cargar el técnico'
                }
            };
        }
    },

    // Actualizar un técnico existente (solo tipo_tecnico y especialidad)
    updateTecnico: async (id, tecnicoData) => {
        try {
            const response = await api.put(`/tecnicos/${id}`, tecnicoData);
            return response;
        } catch (error) {
            console.error(`Error al actualizar técnico ${id}:`, error);
            return {
                data: {
                    success: false,
                    message: 'No se pudo actualizar el técnico'
                }
            };
        }
    }
};

export default tecnicoService;