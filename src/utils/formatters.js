/**
 * Utilidades para formateo y validación de datos
 */

// Función para limpiar un RUT de puntos y guiones
export const limpiarRut = (rut) => {
    if (!rut) return '';
    return String(rut).replace(/\./g, '').replace(/-/g, '');
};

// Función para calcular el dígito verificador de un RUT
export const calcularDV = (rutNum) => {
    let suma = 0;
    let multiplo = 2;
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

// Función para formatear un RUT con puntos y guión
export const formatRut = (rut) => {
    if (!rut) return 'N/A';

    // Limpiar el RUT
    const rutLimpio = limpiarRut(rut);

    // Determinar si necesitamos quitar un dígito verificador existente
    let rutSinDV = rutLimpio;
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

// Función para validar un RUT
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

// Cache para formateo de fechas
const dateFormatCache = new Map();

// Función para formatear fechas
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
            const firstKey = dateFormatCache.keys().next().value;
            dateFormatCache.delete(firstKey);
        }

        dateFormatCache.set(dateString, formattedDate);
        return formattedDate;
    } catch (error) {
        return 'Fecha inválida';
    }
};