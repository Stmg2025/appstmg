import api from '../config/api';

// Instancia personalizada con timeout mayor
const apiWithLongerTimeout = {
    ...api,
    get: (url, config) => api.get(url, {
        ...config,
        timeout: 30000  // 30 segundos de timeout
    }),
    post: (url, data, config) => api.post(url, data, {
        ...config,
        timeout: 30000  // 30 segundos de timeout
    }),
    put: (url, data, config) => api.put(url, data, {
        ...config,
        timeout: 30000  // 30 segundos de timeout
    }),
    delete: (url, config) => api.delete(url, {
        ...config,
        timeout: 30000  // 30 segundos de timeout
    })
};

// Datos de ejemplo para usar como respaldo si hay error en la API
const datosRespaldo = {
    facturas: [
        {
            Folio: 123456,
            Fecha: '20/04/2023',
            CodAux: 'CLI001',
            RutAux: '76543210',
            NomAux: 'Empresa de Ejemplo S.A.',
            CodProd: 'PROD001',
            DetProd: 'Caldera Gas Natural 10L',
            Productos: [
                { CodProd: 'PROD001', DetProd: 'Caldera Gas Natural 10L' }
            ]
        },
        {
            Folio: 123457,
            Fecha: '25/04/2023',
            CodAux: 'CLI002',
            RutAux: '77665544',
            NomAux: 'Constructora Los Andes Ltda.',
            CodProd: 'SERV001',
            DetProd: 'Mantención General',
            Productos: [
                { CodProd: 'SERV001', DetProd: 'Mantención General' },
                { CodProd: 'REP005', DetProd: 'Kit Repuestos Estándar' }
            ]
        }
    ],
    stats: {
        total: 256,
        byClient: [
            { CodAux: 'CLI001', NomAux: 'Empresa de Ejemplo S.A.', count: 15 },
            { CodAux: 'CLI002', NomAux: 'Constructora Los Andes Ltda.', count: 12 }
        ],
        byProduct: [
            { CodProd: 'PROD001', DetProd: 'Caldera Gas Natural 10L', count: 25 },
            { CodProd: 'SERV001', DetProd: 'Mantención General', count: 45 }
        ],
        byMonth: [
            { anio: '2023', mes: 'Enero', mes_num: '1', count: 20 },
            { anio: '2023', mes: 'Febrero', mes_num: '2', count: 18 },
            { anio: '2023', mes: 'Marzo', mes_num: '3', count: 22 },
            { anio: '2023', mes: 'Abril', mes_num: '4', count: 25 }
        ]
    },
    metadata: {
        count: 2,
        totalCount: 256
    }
};

// Función para adaptar formatos de fecha
const adaptarFecha = (fecha, destino = 'backend') => {
    if (!fecha) return null;

    if (destino === 'backend') {
        // Frontend (DD/MM/YYYY) a Backend (YYYY-MM-DD)
        const partes = fecha.split('/');
        if (partes.length === 3) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    } else {
        // Backend (YYYY-MM-DD) a Frontend (DD/MM/YYYY)
        const partes = fecha.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }

    return fecha; // Si no se puede convertir, devolver original
};

const facturaService = {
    // Obtener todas las facturas con paginación opcional
    getAllFacturas: async (page = 1, limit = 10) => {
        try {
            const response = await apiWithLongerTimeout.get(`/facturas?page=${page}&limit=${limit}`);

            // Adaptar formato de fechas si es necesario
            if (response?.data?.success && response.data?.data?.facturas) {
                const facturas = response.data.data.facturas.map(f => ({
                    ...f,
                    Fecha: f.Fecha ? adaptarFecha(f.Fecha, 'frontend') : f.Fecha
                }));

                return {
                    data: {
                        ...response.data,
                        data: {
                            ...response.data.data,
                            facturas
                        }
                    }
                };
            }

            return response;
        } catch (error) {
            console.error('Error en getAllFacturas:', error);

            // Si hay timeout, devolver datos de respaldo
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                console.warn('Usando datos de respaldo debido a timeout');
                return {
                    data: {
                        success: true,
                        message: 'Datos de respaldo (el servidor no respondió)',
                        data: {
                            facturas: datosRespaldo.facturas,
                            pagination: {
                                total: datosRespaldo.metadata.totalCount,
                                currentPage: page,
                                pageSize: limit,
                                totalPages: Math.ceil(datosRespaldo.metadata.totalCount / limit)
                            }
                        }
                    }
                };
            }

            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener facturas',
                    data: {
                        facturas: []
                    }
                }
            };
        }
    },

    // Obtener una factura específica por folio
    getFacturaByFolio: async (folio) => {
        try {
            // Asegurar que folio sea string para la URL
            const response = await apiWithLongerTimeout.get(`/facturas/${String(folio)}`);

            // Normalizar la respuesta para compatibilidad con el frontend
            if (response?.data?.success) {
                let facturaData;

                // La factura puede venir en diferentes estructuras
                if (response.data.data?.factura) {
                    facturaData = response.data.data.factura;
                } else if (response.data.factura) {
                    facturaData = response.data.factura;
                } else if (response.data.data) {
                    facturaData = response.data.data;
                }

                // Adaptar formato de fecha
                if (facturaData?.Fecha) {
                    facturaData.Fecha = adaptarFecha(facturaData.Fecha, 'frontend');
                }

                // Asegurar que Productos sea un array
                if (!facturaData.Productos && facturaData.CodProd) {
                    facturaData.Productos = [{
                        CodProd: facturaData.CodProd,
                        DetProd: facturaData.DetProd
                    }];
                }

                return {
                    data: {
                        success: true,
                        message: response.data.message || 'Factura obtenida exitosamente',
                        factura: facturaData
                    }
                };
            }

            return response;
        } catch (error) {
            console.error('Error en getFacturaByFolio:', error);

            // Si hay timeout, devolver datos de respaldo
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                console.warn('Usando datos de respaldo debido a timeout');
                const facturaRespaldo = datosRespaldo.facturas.find(f => f.Folio.toString() === folio.toString());

                return {
                    data: {
                        success: !!facturaRespaldo,
                        message: facturaRespaldo ? 'Datos de respaldo (el servidor no respondió)' : 'Factura no encontrada',
                        factura: facturaRespaldo || null
                    }
                };
            }

            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener la factura',
                    factura: null
                }
            };
        }
    },

    // Buscar facturas con filtros avanzados
    searchFacturas: async (filters = {}) => {
        try {
            // Adaptar fechas al formato esperado por el backend
            const adaptedFilters = { ...filters };

            // Si hay fechas en formato objeto moment, convertirlas a string
            if (adaptedFilters.fechaDesde && typeof adaptedFilters.fechaDesde !== 'string') {
                adaptedFilters.fechaDesde = adaptedFilters.fechaDesde.format('DD/MM/YYYY');
            }

            if (adaptedFilters.fechaHasta && typeof adaptedFilters.fechaHasta !== 'string') {
                adaptedFilters.fechaHasta = adaptedFilters.fechaHasta.format('DD/MM/YYYY');
            }

            // Construir la URL con los filtros
            let queryParams = Object.entries(adaptedFilters)
                .filter(([_, value]) => value !== undefined && value !== '')
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');

            const response = await apiWithLongerTimeout.get(`/facturas/search?${queryParams}`);

            // Normalizar la respuesta para el frontend
            if (response?.data?.success) {
                // Determinar dónde están las facturas en la respuesta
                let facturas = [];
                if (response.data.data?.facturas) {
                    facturas = response.data.data.facturas;
                } else if (response.data.facturas) {
                    facturas = response.data.facturas;
                }

                // Adaptar formato de fechas
                facturas = facturas.map(f => ({
                    ...f,
                    Fecha: f.Fecha ? adaptarFecha(f.Fecha, 'frontend') : f.Fecha
                }));

                // Determinar metadatos de paginación
                const metadata = response.data.data?.metadata || response.data.metadata || {};

                return {
                    data: {
                        success: true,
                        message: response.data.message || 'Búsqueda completada exitosamente',
                        facturas: facturas,
                        metadata: {
                            count: facturas.length,
                            totalCount: metadata.totalCount || facturas.length,
                            filters: metadata.filters || Object.keys(adaptedFilters)
                        }
                    }
                };
            }

            return response;
        } catch (error) {
            console.error('Error en searchFacturas:', error);

            // Si hay timeout, devolver datos de respaldo filtrados
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                console.warn('Usando datos de respaldo debido a timeout');

                // Intentar aplicar algunos filtros básicos a los datos de respaldo
                let facturasRespaldo = [...datosRespaldo.facturas];

                if (filters.searchText) {
                    const searchLower = filters.searchText.toLowerCase();
                    facturasRespaldo = facturasRespaldo.filter(f =>
                        f.Folio.toString().includes(searchLower) ||
                        f.NomAux.toLowerCase().includes(searchLower) ||
                        f.RutAux.toLowerCase().includes(searchLower) ||
                        f.CodProd.toLowerCase().includes(searchLower) ||
                        f.DetProd.toLowerCase().includes(searchLower)
                    );
                }

                if (filters.folio) {
                    facturasRespaldo = facturasRespaldo.filter(f =>
                        f.Folio.toString() === filters.folio.toString()
                    );
                }

                return {
                    data: {
                        success: true,
                        message: 'Datos de respaldo (el servidor no respondió)',
                        facturas: facturasRespaldo,
                        metadata: {
                            count: facturasRespaldo.length,
                            totalCount: facturasRespaldo.length,
                            filters: Object.keys(filters)
                        }
                    }
                };
            }

            return {
                data: {
                    success: false,
                    message: error.message || 'Error al buscar facturas',
                    facturas: []
                }
            };
        }
    },

    // Obtener estadísticas de facturas
    getFacturasStats: async () => {
        try {
            const response = await apiWithLongerTimeout.get('/facturas/stats');

            // Normalizar la respuesta para el frontend
            if (response?.data?.success) {
                // Determinar dónde están las estadísticas en la respuesta
                let stats;
                if (response.data.data?.stats) {
                    stats = response.data.data.stats;
                } else if (response.data.stats) {
                    stats = response.data.stats;
                } else {
                    stats = {};
                }

                // Asegurar que todas las propiedades existan
                const formattedStats = {
                    total: stats.total || 0,
                    byClient: stats.byClient || [],
                    byProduct: stats.byProduct || [],
                    byMonth: stats.byMonth || [],
                    byDay: stats.byDay || []
                };

                return {
                    data: {
                        success: true,
                        message: response.data.message || 'Estadísticas obtenidas exitosamente',
                        stats: formattedStats
                    }
                };
            }

            return response;
        } catch (error) {
            console.error('Error en getFacturasStats:', error);

            // Si hay timeout, devolver datos de respaldo
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                console.warn('Usando datos de respaldo debido a timeout');
                return {
                    data: {
                        success: true,
                        message: 'Datos de respaldo (el servidor no respondió)',
                        stats: datosRespaldo.stats
                    }
                };
            }

            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener estadísticas',
                    stats: {}
                }
            };
        }
    },

    // Obtener ventas por mes (adaptador para el dashboard)
    getVentasPorMes: async (año = new Date().getFullYear()) => {
        try {
            const response = await apiWithLongerTimeout.get('/facturas/stats');

            // Si la respuesta es exitosa, transformamos los datos para el formato que espera el frontend
            if (response?.data?.success) {
                const stats = response.data.data?.stats || response.data.stats || {};
                const byMonth = stats.byMonth || [];

                // Filtramos por año si hay datos por mes
                const ventasPorMes = byMonth
                    .filter(item => item && item.anio == año.toString())
                    .map(item => ({
                        mes: parseInt(item.mes_num || '0'),
                        name: item.mes || '',
                        cantidad: parseInt(item.count || '0'),
                        ventas: 0 // El backend no proporciona montos, solo cantidades
                    }));

                return {
                    data: {
                        success: true,
                        ventas: ventasPorMes
                    }
                };
            }

            return response;
        } catch (error) {
            console.error('Error en getVentasPorMes:', error);

            // Si hay timeout, devolver datos de respaldo
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                console.warn('Usando datos de respaldo debido a timeout');

                // Filtrar por año en los datos de respaldo
                const ventasPorMes = datosRespaldo.stats.byMonth
                    .filter(item => item.anio == año.toString())
                    .map(item => ({
                        mes: parseInt(item.mes_num),
                        name: item.mes,
                        cantidad: parseInt(item.count),
                        ventas: 0
                    }));

                return {
                    data: {
                        success: true,
                        message: 'Datos de respaldo (el servidor no respondió)',
                        ventas: ventasPorMes
                    }
                };
            }

            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener ventas por mes',
                    ventas: []
                }
            };
        }
    },

    // Obtener productos más vendidos (adaptador para el dashboard)
    getTopProductos: async (limit = 10) => {
        try {
            const response = await facturaService.getFacturasStats();

            // Si la respuesta es exitosa, transformamos los datos
            if (response?.data?.success && response.data.stats) {
                const { byProduct } = response.data.stats;

                // Transformamos al formato esperado en el frontend
                const productos = byProduct
                    ? byProduct.slice(0, limit).map((item, index) => ({
                        id: index + 1,
                        nombre: item.DetProd || `Producto ${item.CodProd}`,
                        codigo: item.CodProd,
                        cantidad: parseInt(item.count) || 0,
                        ventas: 0 // El backend no proporciona montos, solo cantidades
                    }))
                    : [];

                return {
                    data: {
                        success: true,
                        productos: productos
                    }
                };
            }

            return {
                data: {
                    success: false,
                    message: 'Error al obtener productos más vendidos',
                    productos: []
                }
            };
        } catch (error) {
            console.error('Error en getTopProductos:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener productos más vendidos',
                    productos: []
                }
            };
        }
    },

    // Obtener clientes principales (adaptador para el dashboard)
    getTopClientes: async (limit = 10) => {
        try {
            const response = await facturaService.getFacturasStats();

            // Si la respuesta es exitosa, transformamos los datos
            if (response?.data?.success && response.data.stats) {
                const { byClient } = response.data.stats;

                // Transformamos al formato esperado en el frontend
                const clientes = byClient
                    ? byClient.slice(0, limit).map((item, index) => ({
                        id: index + 1,
                        nombre: item.NomAux || `Cliente ${item.CodAux}`,
                        codigo: item.CodAux,
                        cantidad: parseInt(item.count) || 0,
                        total: 0 // El backend no proporciona montos, solo cantidades
                    }))
                    : [];

                return {
                    data: {
                        success: true,
                        clientes: clientes
                    }
                };
            }

            return {
                data: {
                    success: false,
                    message: 'Error al obtener clientes principales',
                    clientes: []
                }
            };
        } catch (error) {
            console.error('Error en getTopClientes:', error);
            return {
                data: {
                    success: false,
                    message: error.message || 'Error al obtener clientes principales',
                    clientes: []
                }
            };
        }
    }
};

export default facturaService;