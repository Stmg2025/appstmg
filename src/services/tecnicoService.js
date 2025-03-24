import api from '../config/api';

const tecnicoService = {
    // Obtener todos los técnicos
    getTecnicos: async () => {
        return await api.get('/tecnicos');
    },

    // Obtener un técnico por ID
    getTecnicoById: async (id) => {
        return await api.get(`/tecnicos/${id}`);
    },

    // Actualizar un técnico existente (solo tipo_tecnico y especialidad)
    updateTecnico: async (id, tecnicoData) => {
        return await api.put(`/tecnicos/${id}`, tecnicoData);
    }
};

export default tecnicoService;