import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Statistic, Typography, Select,
    Spin, Empty, Alert, Button, Tabs
} from 'antd';
import {
    BarChartOutlined, CalendarOutlined, UserOutlined,
    ShoppingOutlined, ReloadOutlined
} from '@ant-design/icons';
import {
    BarChart, Bar, PieChart, Pie, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import facturaService from '../../services/facturaService';

const { Title } = Typography;
const { Option } = Select;

// Constantes
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const COLORES = ['#1890ff', '#2fc25b', '#facc14', '#f04864', '#8543e0', '#13c2c2', '#fa8c16', '#722ed1', '#eb2f96', '#52c41a'];
const ANIOS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i); // Genera los últimos 5 años

const FacturaDashboard = () => {
    // Estados
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [año, setAño] = useState(new Date().getFullYear());
    const [datos, setDatos] = useState({
        ventasPorMes: [],
        topProductos: [],
        topClientes: [],
        totalFacturas: 0,
    });
    const [activeTabKey, setActiveTabKey] = useState('1');

    // Función para cargar los datos
    const cargarDatos = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await facturaService.getFacturasStats();

            if (response?.data?.success && response.data?.stats) {
                const { stats } = response.data;
                setDatos({
                    ventasPorMes: procesarVentasPorMes(stats.byMonth, año),
                    topProductos: procesarTopProductos(stats.byProduct),
                    topClientes: procesarTopClientes(stats.byClient),
                    totalFacturas: stats.total || 0,
                });
            } else {
                setError("Error al cargar datos del servidor: " + (response?.data?.message || "Respuesta inválida"));
            }
        } catch (err) {
            setError("Error de conexión: " + (err.message || "Error desconocido"));
        } finally {
            setLoading(false);
        }
    };

    // Funciones de procesamiento de datos
    const procesarVentasPorMes = (data, año) => {
        if (!Array.isArray(data)) {
            console.warn("Datos de ventas por mes no son válidos:", data);
            return MESES.map(mes => ({ name: mes, cantidad: 0 }));
        }

        // Crear array con todos los meses en 0 por defecto
        const mesesIniciales = MESES.map(mes => ({ name: mes, cantidad: 0 }));

        // Filtrar por año y actualizar valores
        data.forEach(item => {
            if (item && item.anio && item.anio.toString() === año.toString() &&
                item.mes_num && !isNaN(parseInt(item.mes_num))) {
                const mesIndex = parseInt(item.mes_num) - 1; // Índice 0-based
                if (mesIndex >= 0 && mesIndex < 12) {
                    mesesIniciales[mesIndex].cantidad = parseInt(item.count) || 0;
                }
            }
        });

        return mesesIniciales;
    };

    const procesarTopProductos = (data) => {
        if (!Array.isArray(data)) {
            console.warn("Datos de productos no son válidos:", data);
            return [];
        }

        return data.slice(0, 10).map((item, i) => ({
            id: i + 1,
            nombre: item.DetProd || `Producto ${item.CodProd || 'Desconocido'}`,
            codigo: item.CodProd || '',
            cantidad: parseInt(item.count) || 0,
        }));
    };

    const procesarTopClientes = (data) => {
        if (!Array.isArray(data)) {
            console.warn("Datos de clientes no son válidos:", data);
            return [];
        }

        return data.slice(0, 10).map((item, i) => ({
            id: i + 1,
            nombre: item.NomAux || `Cliente ${item.CodAux || 'Desconocido'}`,
            codigo: item.CodAux || '',
            cantidad: parseInt(item.count) || 0,
        }));
    };

    // Efectos
    useEffect(() => {
        cargarDatos();
    }, [año]);

    // Manejadores
    const handleAñoChange = (nuevoAño) => {
        setAño(nuevoAño);
    };

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // Subcomponentes de Gráficos
    const FacturasMensualesGrafico = () => (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datos.ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} facturas`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="cantidad" name="Cantidad de Facturas" fill="#722ed1" />
            </BarChart>
        </ResponsiveContainer>
    );

    const TopProductosGrafico = () => (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datos.topProductos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nombre" width={150} />
                <Tooltip formatter={(value) => [`${value} facturas`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="cantidad" name="Facturas Emitidas" fill="#2fc25b" />
            </BarChart>
        </ResponsiveContainer>
    );

    const TopClientesGrafico = () => (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={datos.topClientes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nombre, percent }) => {
                        const nombreCorto = nombre.length > 15 ? nombre.substring(0, 15) + '...' : nombre;
                        return `${nombreCorto}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                    nameKey="nombre"
                >
                    {datos.topClientes.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value, name, props) => [`${value} facturas`, props.payload.nombre]}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );

    // Componente para calcular el total
    const calcularTotal = (items, propiedad) => {
        if (!Array.isArray(items)) return 0;
        return items.reduce((total, item) => total + (Number(item[propiedad]) || 0), 0);
    };

    // Definición de pestañas
    const tabItems = [
        {
            key: '1',
            label: <span><BarChartOutlined /> Facturas por Mes</span>,
            children: (
                <Card
                    title="Cantidad de Facturas por Mes"
                    extra={<Button icon={<ReloadOutlined />} onClick={cargarDatos}>Actualizar</Button>}
                >
                    {datos.ventasPorMes && datos.ventasPorMes.length > 0 ? (
                        <FacturasMensualesGrafico />
                    ) : (
                        <Empty description="No hay datos disponibles" />
                    )}
                </Card>
            ),
        },
        {
            key: '2',
            label: <span><ShoppingOutlined /> Productos Más Vendidos</span>,
            children: (
                <Card
                    title="Top Productos"
                    extra={<Button icon={<ReloadOutlined />} onClick={cargarDatos}>Actualizar</Button>}
                >
                    {datos.topProductos && datos.topProductos.length > 0 ? (
                        <TopProductosGrafico />
                    ) : (
                        <Empty description="No hay datos disponibles" />
                    )}
                </Card>
            ),
        },
        {
            key: '3',
            label: <span><UserOutlined /> Clientes</span>,
            children: (
                <Card
                    title="Top Clientes por Cantidad de Facturas"
                    extra={<Button icon={<ReloadOutlined />} onClick={cargarDatos}>Actualizar</Button>}
                >
                    {datos.topClientes && datos.topClientes.length > 0 ? (
                        <TopClientesGrafico />
                    ) : (
                        <Empty description="No hay datos disponibles" />
                    )}
                </Card>
            ),
        },
    ];

    return (
        <div className="factura-dashboard">
            <Title level={2}>Dashboard de Facturas</Title>

            {/* Filtros */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <label style={{ marginRight: 8 }}>Año: </label>
                        <Select style={{ width: 120 }} value={año} onChange={handleAñoChange}>
                            {ANIOS.map(a => <Option key={a} value={a}>{a}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
                        <Button icon={<ReloadOutlined />} onClick={cargarDatos}>
                            Actualizar
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Mensajes de estado */}
            {error && (
                <Alert
                    message="Error al cargar datos"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                    action={<Button size="small" danger onClick={() => setError(null)}>Cerrar</Button>}
                />
            )}

            {/* Contenido principal */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="large" />
                    <Typography.Text style={{ display: 'block', marginTop: 10 }}>
                        Cargando datos de facturas...
                    </Typography.Text>
                </div>
            ) : (
                <>
                    {/* Tarjetas de estadísticas */}
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col xs={24} sm={8}>
                            <Card>
                                <Statistic
                                    title="Total Facturas"
                                    value={datos.totalFacturas}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<BarChartOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card>
                                <Statistic
                                    title="Facturas este Año"
                                    value={calcularTotal(datos.ventasPorMes, 'cantidad')}
                                    valueStyle={{ color: '#1890ff' }}
                                    prefix={<CalendarOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card>
                                <Statistic
                                    title={`Top ${datos.topProductos.length} Productos`}
                                    value={calcularTotal(datos.topProductos, 'cantidad')}
                                    valueStyle={{ color: '#722ed1' }}
                                    prefix={<ShoppingOutlined />}
                                    suffix="facturas"
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Tabs con gráficos */}
                    <Tabs activeKey={activeTabKey} onChange={handleTabChange} items={tabItems} />
                </>
            )}
        </div>
    );
};

export default FacturaDashboard;