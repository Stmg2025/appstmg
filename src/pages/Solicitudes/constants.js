import moment from 'moment';

// Mapeo de regiones
export const REGIONES = {
    '1': 'Primera Región (de Tarapacá)',
    '2': 'Segunda Región (de Antofagasta)',
    '3': 'Tercera Región (de Atacama)',
    '4': 'Cuarta Región (de Coquimbo)',
    '5': 'Quinta Región (de Valparaíso)',
    '6': 'Sexta Región (del Libertador B.O higgins)',
    '7': 'Séptima Región (del Maule)',
    '8': 'Octava Región (del Bío-Bío)',
    '9': 'Novena Región (de la Araucanía)',
    '10': 'Décima Región (de los Lagos)',
    '11': 'Undécima Región (de Aisén del General Ca)',
    '12': 'Duodécima Región (de Magallanes y de la)',
    '13': 'Región Metropolitana (de Santiago)',
    '14': 'Decimocuarta Región de los Rios',
    '15': 'Decimoquinta Región de Arica y Parinacota',
    '16': 'Región de Ñuble'
};

// Mapeo de comunas por región (optimizado)
export const COMUNAS_POR_REGION = {
    '1': [
        { id: '01101', nombre: 'Iquique' },
        { id: '01102', nombre: 'Camiña' },
        { id: '01103', nombre: 'Colchane' },
        { id: '01104', nombre: 'Huara' },
        { id: '01105', nombre: 'Pica' },
        { id: '01106', nombre: 'Pozo Almonte' },
        { id: 'ALTOHOS', nombre: 'Alto Hospicio' }
    ],
    '2': [
        { id: '02101', nombre: 'Antofagasta' },
        { id: '02102', nombre: 'Mejillones' },
        { id: '02103', nombre: 'Sierra Gorda' },
        { id: '02104', nombre: 'Taltal' },
        { id: '02201', nombre: 'Calama' },
        { id: '02202', nombre: 'Ollagüe' },
        { id: '02203', nombre: 'San Pedro de Atacama' },
        { id: '02301', nombre: 'Tocopilla' },
        { id: '02302', nombre: 'María Elena' }
    ],
    // Las demás regiones se mantienen igual
    '13': [
        { id: '13101', nombre: 'Santiago' },
        { id: '13102', nombre: 'Cerrillos' },
        { id: '13103', nombre: 'Cerro Navia' },
        { id: '13104', nombre: 'Conchalí' },
        { id: '13105', nombre: 'El Bosque' },
        { id: '13106', nombre: 'Estación Central' },
        { id: '13107', nombre: 'Huechuraba' },
        { id: '13108', nombre: 'Independencia' },
        { id: '13109', nombre: 'La Cisterna' },
        { id: '13110', nombre: 'La Florida' },
        { id: '13111', nombre: 'La Granja' },
        { id: '13112', nombre: 'La Pintana' },
        { id: '13113', nombre: 'La Reina' },
        { id: '13114', nombre: 'Las Condes' },
        { id: '13115', nombre: 'Lo Barnechea' },
        { id: '13116', nombre: 'Lo Espejo' },
        { id: '13117', nombre: 'Lo Prado' },
        { id: '13118', nombre: 'Macul' },
        { id: '13119', nombre: 'Maipú' },
        { id: '13120', nombre: 'Ñuñoa' },
        { id: '13121', nombre: 'Pedro Aguirre Cerda' },
        { id: '13122', nombre: 'Peñalolén' },
        { id: '13123', nombre: 'Providencia' },
        { id: '13124', nombre: 'Pudahuel' },
        { id: '13125', nombre: 'Quilicura' },
        { id: '13126', nombre: 'Quinta Normal' },
        { id: '13127', nombre: 'Recoleta' },
        { id: '13128', nombre: 'Renca' },
        { id: '13129', nombre: 'San Joaquín' },
        { id: '13130', nombre: 'San Miguel' },
        { id: '13131', nombre: 'San Ramón' },
        { id: '13132', nombre: 'Vitacura' }
    ],
    '14': [
        { id: '10501', nombre: 'Valdivia' },
        { id: '10503', nombre: 'Futrono' },
        { id: '10505', nombre: 'Lago Ranco' },
        { id: '10506', nombre: 'Lanco' },
        { id: '10510', nombre: 'Paillaco' },
        { id: 'Rio', nombre: 'Rio Bueno' }
    ],
    '15': [
        { id: '01201', nombre: 'Arica' },
        { id: '01202', nombre: 'Camarones' },
        { id: '01301', nombre: 'Putre' },
        { id: '01302', nombre: 'General Lagos' },
        { id: 'ARI', nombre: 'Arica' }
    ]
};

// Utilidades para RUT chileno
export const limpiarRut = (rut) => {
    if (!rut) return '';
    return String(rut).replace(/\./g, '').replace(/-/g, '');
};

export const calcularDV = (rutNum) => {
    let suma = 0;
    let multiplo = 2;

    // Convertir a string para asegurar que podemos iterar
    let rutStr = String(rutNum);

    for (let i = rutStr.length - 1; i >= 0; i--) {
        suma += parseInt(rutStr.charAt(i)) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    let dvCalculado = 11 - (suma % 11);

    if (dvCalculado === 11) return '0';
    if (dvCalculado === 10) return 'K';

    return dvCalculado.toString();
};

// Función para formatear RUT chileno - VERSIÓN CORREGIDA PARA SIEMPRE CALCULAR EL DV
export const formatRut = (rut) => {
    if (!rut) return 'N/A';

    // Limpiar: asegurar que es string y sin puntos ni guiones
    const rutLimpio = String(rut).replace(/\./g, '').replace(/-/g, '');

    // El codaux es el cuerpo del RUT, necesitamos calcular el DV
    // Si el RUT ya tiene un DV (últimos caracteres), lo quitamos para quedarnos solo con el cuerpo
    let rutSinDV = rutLimpio;

    // Si el RUT parece tener más de 8 dígitos, asumimos que incluye el DV y lo quitamos
    if (rutLimpio.length > 8) {
        rutSinDV = rutLimpio.slice(0, -1);
    }

    // Calcular el dígito verificador
    const dv = calcularDV(rutSinDV);

    // Formatear con puntos
    let rutFormateado = '';
    let j = 0;

    for (let i = rutSinDV.length - 1; i >= 0; i--) {
        j++;
        rutFormateado = rutSinDV.charAt(i) + rutFormateado;
        if (j % 3 === 0 && i !== 0) {
            rutFormateado = '.' + rutFormateado;
        }
    }

    return rutFormateado + '-' + dv;
};

// Para validar un RUT
export const validarRut = (rut) => {
    if (!rut) return false;

    try {
        // Limpiar puntos y guiones
        const rutLimpio = limpiarRut(rut);

        // Separar cuerpo y dígito verificador
        const dv = rutLimpio.slice(-1).toUpperCase();
        const rutSinDV = rutLimpio.slice(0, -1);

        // Calcular el dígito verificador esperado
        const dvCalculado = calcularDV(rutSinDV);

        // Comparar
        return dv === dvCalculado;
    } catch (error) {
        return false;
    }
};

// Cache para optimizar garantía activa
const garantiaCache = new Map();

// Función para verificar si la garantía está activa
export const garantiaActiva = (fechaFactura) => {
    if (!fechaFactura) return false;

    // Usar caché para mejorar rendimiento
    if (garantiaCache.has(fechaFactura)) {
        return garantiaCache.get(fechaFactura);
    }

    const fechaLimite = moment(fechaFactura).add(1, 'year');
    const esActiva = moment().isBefore(fechaLimite);

    // Guardar en cache solo si está dentro de un rango razonable
    // (evita llenar el caché con fechas muy antiguas)
    if (moment(fechaFactura).isAfter(moment().subtract(2, 'years'))) {
        garantiaCache.set(fechaFactura, esActiva);
    }

    return esActiva;
};

// Mapeo de estados
export const ESTADOS = {
    'AP': { text: 'Aprobada', color: 'green' },
    'PE': { text: 'Pendiente', color: 'orange' },
    'CA': { text: 'Cancelada', color: 'red' },
    'FI': { text: 'Finalizada', color: 'blue' }
};

// Color del estado según su nombre
export const getColorByEstadoNombre = (nombre) => {
    if (!nombre) return 'default';

    try {
        const nombreLower = nombre.toLowerCase();

        if (nombreLower.includes('pendiente')) return 'orange';
        if (nombreLower.includes('proceso') || nombreLower.includes('progreso')) return 'blue';
        if (nombreLower.includes('completa') || nombreLower.includes('finaliza')) return 'green';
        if (nombreLower.includes('cancela') || nombreLower.includes('rechaza')) return 'red';
    } catch (error) {
        console.error("Error al procesar estado:", error);
    }

    return 'default';
};

// Mapeo de tipos de prioridad para optimización
const PRIORIDAD_COLORS = {
    alta: 'red',
    urgente: 'red',
    media: 'orange',
    normal: 'orange',
    baja: 'green',
    atrasado: 'magenta'
};

// Color de la prioridad optimizado
export const getPrioridadColor = (prioridad) => {
    if (!prioridad) return 'default';

    const prioridadLower = prioridad.toLowerCase();

    // Buscar coincidencias exactas primero (más rápido)
    if (PRIORIDAD_COLORS[prioridadLower]) {
        return PRIORIDAD_COLORS[prioridadLower];
    }

    // Si no hay coincidencia exacta, buscar inclusiones
    for (const [key, color] of Object.entries(PRIORIDAD_COLORS)) {
        if (prioridadLower.includes(key)) {
            return color;
        }
    }

    return 'default';
};

// Mapeo de tipos de solicitud
const TIPOS_MAP = {
    'Garantia': 'Garantía',
    'Servicio': 'Servicio',
    'Mantenimiento': 'Mantenimiento',
    'Cortesia': 'Cortesía',
    'Instalacion': 'Instalación',
    'Reparacion': 'Reparación',
    'Conversion': 'Conversión',
    'Logistica': 'Logística'
};

export const getTipoLabel = (tipo) => {
    return TIPOS_MAP[tipo] || tipo || 'N/A';
};

// Formateo de fechas con cache para mejorar rendimiento
const dateFormatCache = new Map();

export const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';

    // Usar cache para fechas ya formateadas
    if (dateFormatCache.has(dateString)) {
        return dateFormatCache.get(dateString);
    }

    try {
        const formattedDate = new Date(dateString).toLocaleString('es-CL');

        // Limitar tamaño del caché para evitar fugas de memoria
        if (dateFormatCache.size > 100) {
            // Eliminar entradas antiguas si el caché crece demasiado
            const firstKey = dateFormatCache.keys().next().value;
            dateFormatCache.delete(firstKey);
        }

        dateFormatCache.set(dateString, formattedDate);
        return formattedDate;
    } catch (error) {
        return 'Fecha inválida';
    }
};

// Mapeo de áreas de trabajo
const AREAS_MAP = {
    'PLANTA': 'Taller'
};

// Para áreas de trabajo
export const getAreaTrabajoLabel = (area) => {
    if (!area) return 'N/A';
    return AREAS_MAP[area] || area;
};