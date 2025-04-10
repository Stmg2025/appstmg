import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Statistic, Table, Typography, Spin, message, Tabs, Tag,
    Select, DatePicker, Input, Button, Divider, Progress, Badge, Tooltip, Space,
    Empty
} from 'antd';
import {
    DollarOutlined, DatabaseOutlined, FileOutlined, TeamOutlined,
    ToolOutlined, AlertOutlined, CheckCircleOutlined, ClockCircleOutlined,
    SearchOutlined, FilterOutlined, ReloadOutlined, BarChartOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import inventoryService from '../../services/inventoryService';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Dashboard = () => {
    // State variables
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [statistics, setStatistics] = useState({
        totalInventory: 0,
        lowStockItems: [],
        totalSolicitudes: 0,
        solicitudesByEstado: {},
        solicitudesAsignadas: 0,
        solicitudesSinAsignar: 0,
        tecnicosActivos: 0,
        tecnicosByEspecialidad: {},
        solicitudesMensuales: []
    });

    // Chart filters
    const [chartFilters, setChartFilters] = useState({
        dateRange: [moment().subtract(5, 'months'), moment()],
        view: 'monthly'
    });

    // Filters
    const [filters, setFilters] = useState({
        estado: "all",
        tecnico: "all",
        dateRange: null,
        searchText: ""
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    // Update chart when filters change
    useEffect(() => {
        if (solicitudes.length > 0) {
            updateChartData();
        }
    }, [chartFilters, solicitudes]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            console.log("Iniciando carga de datos...");

            // Fetch all the data in parallel with debugging logs
            console.log("Solicitando inventario...");
            const inventoryResp = await inventoryService.getInventory();
            console.log("Respuesta de inventario:", inventoryResp);

            console.log("Solicitando solicitudes...");
            const solicitudesResp = await solicitudService.getAllSolicitudes(1, 1000, true);
            console.log("Respuesta de solicitudes:", solicitudesResp);

            console.log("Solicitando técnicos...");
            const tecnicosResp = await tecnicoService.getTecnicos();
            console.log("Respuesta de técnicos:", tecnicosResp);

            console.log("Solicitando estados...");
            const estadosResp = await estadoSolicitudService.getEstados();
            console.log("Respuesta de estados:", estadosResp);

            // Process data and update states if successful
            const inventoryItems = inventoryResp?.data?.success ? inventoryResp.data.inventory || [] : [];
            const solicitudesItems = solicitudesResp?.data?.success ? solicitudesResp.data.solicitudes || [] : [];
            const tecnicosItems = tecnicosResp?.data?.success ? tecnicosResp.data.tecnicos || [] : [];
            const estadosItems = estadosResp?.data?.success ? estadosResp.data.estados || [] : [];

            console.log("Datos procesados:");
            console.log("- Inventario:", inventoryItems.length, "items");
            console.log("- Solicitudes:", solicitudesItems.length, "items");
            console.log("- Técnicos:", tecnicosItems.length, "items");
            console.log("- Estados:", estadosItems.length, "items");

            setInventory(inventoryItems);
            setSolicitudes(solicitudesItems);
            setTecnicos(tecnicosItems);
            setEstados(estadosItems);

            // Process statistics
            processStatistics(inventoryItems, solicitudesItems, tecnicosItems, estadosItems);

        } catch (error) {
            console.error("Error al obtener datos:", error);
            message.error("No se pudieron cargar los datos del dashboard");
        } finally {
            setLoading(false);
        }
    };

    const processStatistics = (inventory, solicitudes, tecnicos, estados) => {
        // Inventory stats
        const lowStockItems = inventory.filter(item => item.stock < 5);

        // Solicitudes stats
        const solicitudesByEstado = {};
        const solicitudesAsignadas = solicitudes.filter(s => s.tecnico_asignado).length;
        const solicitudesSinAsignar = solicitudes.length - solicitudesAsignadas;

        // Process estado counts
        solicitudes.forEach(solicitud => {
            const estado = solicitud.estado;
            solicitudesByEstado[estado] = (solicitudesByEstado[estado] || 0) + 1;
        });

        // Tecnicos stats
        const tecnicosByEspecialidad = {};
        tecnicos.forEach(tecnico => {
            const especialidad = tecnico.especialidad || 'Sin especialidad';
            tecnicosByEspecialidad[especialidad] = (tecnicosByEspecialidad[especialidad] || 0) + 1;
        });

        // Monthly solicitudes (for chart)
        const solicitudesMensuales = processSolicitudesByMonth(solicitudes);

        setStatistics({
            totalInventory: inventory.length,
            lowStockItems,
            totalSolicitudes: solicitudes.length,
            solicitudesByEstado,
            solicitudesAsignadas,
            solicitudesSinAsignar,
            tecnicosActivos: tecnicos.length,
            tecnicosByEspecialidad,
            solicitudesMensuales
        });

        console.log("Estadísticas procesadas:", {
            totalInventory: inventory.length,
            lowStockItems: lowStockItems.length,
            totalSolicitudes: solicitudes.length,
            solicitudesByEstado,
            solicitudesAsignadas,
            solicitudesSinAsignar,
            tecnicosActivos: tecnicos.length,
            tecnicosByEspecialidad,
            solicitudesMensuales: solicitudesMensuales.length
        });
    };

    const processSolicitudesByMonth = (solicitudes) => {
        const [startDate, endDate] = chartFilters.dateRange || [moment().subtract(5, 'months'), moment()];
        const view = chartFilters.view || 'monthly';
        const monthlyData = {};

        // Generate all months in the range to ensure we have entries for months with zero solicitudes
        if (view === 'monthly') {
            let current = moment(startDate).startOf('month');
            while (current.isSameOrBefore(endDate)) {
                const monthYear = current.format('MM/YYYY');
                monthlyData[monthYear] = 0;
                current.add(1, 'month');
            }
        }

        // Count solicitudes
        solicitudes.forEach(solicitud => {
            if (solicitud.fecha) {
                const date = moment(solicitud.fecha);

                // Skip if outside date range
                if (date.isBefore(startDate) || date.isAfter(endDate)) {
                    return;
                }

                const key = view === 'monthly'
                    ? date.format('MM/YYYY')
                    : date.format('DD/MM/YYYY');

                monthlyData[key] = (monthlyData[key] || 0) + 1;
            }
        });

        // Convert to chart format
        const chartData = Object.keys(monthlyData).map(key => ({
            period: key,
            solicitudes: monthlyData[key]
        }));

        // Sort by date
        return chartData.sort((a, b) => {
            const isMonthly = view === 'monthly';
            const [aMonth, aYear] = isMonthly ? a.period.split('/') : a.period.split('/').slice(1);
            const [bMonth, bYear] = isMonthly ? b.period.split('/') : b.period.split('/').slice(1);
            const aDay = isMonthly ? 1 : a.period.split('/')[0];
            const bDay = isMonthly ? 1 : b.period.split('/')[0];

            const aDate = new Date(aYear, aMonth - 1, aDay);
            const bDate = new Date(bYear, bMonth - 1, bDay);
            return aDate - bDate;
        });
    };

    const updateChartData = () => {
        const solicitudesMensuales = processSolicitudesByMonth(solicitudes);
        setStatistics(prev => ({
            ...prev,
            solicitudesMensuales
        }));
    };

    const handleChartFilterChange = (filterName, value) => {
        setChartFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const handleFilterChange = (filterName, value) => {
        setFilters({
            ...filters,
            [filterName]: value
        });
    };

    const resetFilters = () => {
        setFilters({
            estado: "all",
            tecnico: "all",
            dateRange: null,
            searchText: ""
        });
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'PEN': 'orange',
            'ASI': 'blue',
            'PRO': 'purple',
            'FIN': 'green',
            'CAN': 'red'
        };
        return statusColors[status] || 'default';
    };

    // Filter solicitudes based on current filters
    const getFilteredSolicitudes = () => {
        return solicitudes.filter(solicitud => {
            // Estado filter
            if (filters.estado !== "all" && solicitud.estado !== filters.estado) {
                return false;
            }

            // Tecnico filter
            if (filters.tecnico !== "all") {
                if (filters.tecnico === "assigned" && !solicitud.tecnico_asignado) {
                    return false;
                }
                if (filters.tecnico === "unassigned" && solicitud.tecnico_asignado) {
                    return false;
                }
                if (!isNaN(parseInt(filters.tecnico)) && solicitud.tecnico_asignado !== parseInt(filters.tecnico)) {
                    return false;
                }
            }

            // Search text
            if (filters.searchText && !JSON.stringify(solicitud).toLowerCase().includes(filters.searchText.toLowerCase())) {
                return false;
            }

            // Date range filter
            if (filters.dateRange && solicitud.fecha) {
                const solicitudDate = new Date(solicitud.fecha);
                if (solicitudDate < filters.dateRange[0] || solicitudDate > filters.dateRange[1]) {
                    return false;
                }
            }

            return true;
        });
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Title level={2}>Panel de Control</Title>
                                <Text type="secondary">Resumen general del sistema</Text>
                            </Col>
                            <Col>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchAllData}
                                >
                                    Actualizar datos
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Solicitudes Totales"
                            value={statistics.totalSolicitudes}
                            prefix={<FileOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <Progress
                            percent={100}
                            showInfo={false}
                            strokeColor="#1890ff"
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Técnicos Activos"
                            value={statistics.tecnicosActivos}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <Progress
                            percent={100}
                            showInfo={false}
                            strokeColor="#52c41a"
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Items en Inventario"
                            value={statistics.totalInventory}
                            prefix={<DatabaseOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                        <Progress
                            percent={100}
                            showInfo={false}
                            strokeColor="#722ed1"
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Repuestos Bajo Stock"
                            value={statistics.lowStockItems.length}
                            prefix={<AlertOutlined />}
                            valueStyle={{ color: '#fa541c' }}
                        />
                        <Progress
                            percent={(statistics.lowStockItems.length / statistics.totalInventory) * 100}
                            showInfo={false}
                            strokeColor="#fa541c"
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
                <TabPane
                    tab={<span><FileOutlined /> Solicitudes</span>}
                    key="1"
                >
                    {/* Solicitudes Dashboard */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={18}>
                            <Card
                                title="Evolución de Solicitudes"
                                style={{ height: '100%' }}
                                extra={
                                    <Space>
                                        <Select
                                            value={chartFilters.view}
                                            onChange={(value) => handleChartFilterChange('view', value)}
                                            style={{ width: 120 }}
                                        >
                                            <Option value="monthly">Mensual</Option>
                                            <Option value="daily">Diario</Option>
                                        </Select>
                                        <RangePicker
                                            value={chartFilters.dateRange}
                                            onChange={(dates) => handleChartFilterChange('dateRange', dates)}
                                            allowClear={false}
                                        />
                                    </Space>
                                }
                            >
                                {/* Fixed size chart container */}
                                <div style={{ height: '250px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                                    {statistics.solicitudesMensuales.length > 0 ? (
                                        <div style={{
                                            height: '250px',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            gap: '8px',
                                            overflowX: 'auto',
                                            paddingBottom: '20px'
                                        }}>
                                            {statistics.solicitudesMensuales.map((item, index) => {
                                                const maxValue = Math.max(...statistics.solicitudesMensuales.map(x => x.solicitudes) || [1]);
                                                const heightPercentage = (item.solicitudes / maxValue) * 100;

                                                return (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            flex: `0 0 ${Math.max(60, 100 / statistics.solicitudesMensuales.length)}px`,
                                                            minWidth: '60px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            height: '100%',
                                                            justifyContent: 'flex-end'
                                                        }}
                                                    >
                                                        <Tooltip title={`${item.period}: ${item.solicitudes} solicitudes`}>
                                                            <div
                                                                style={{
                                                                    width: '75%',
                                                                    height: `${Math.max(10, heightPercentage)}%`,
                                                                    backgroundColor: '#1890ff',
                                                                    borderRadius: '4px 4px 0 0',
                                                                    position: 'relative',
                                                                    minHeight: '10px'
                                                                }}
                                                            >
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '-20px',
                                                                    width: '100%',
                                                                    textAlign: 'center',
                                                                    fontSize: '12px',
                                                                    color: '#000'
                                                                }}>
                                                                    {item.solicitudes}
                                                                </div>
                                                            </div>
                                                        </Tooltip>
                                                        <div style={{
                                                            marginTop: '8px',
                                                            fontSize: '12px',
                                                            textAlign: 'center',
                                                            width: '100%',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {item.period}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <Empty description="No hay datos disponibles" style={{ marginTop: '50px' }} />
                                    )}
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={6}>
                            <Card title="Estado de Solicitudes" style={{ height: '100%' }}>
                                <Row gutter={[8, 8]}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Asignadas"
                                            value={statistics.solicitudesAsignadas}
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Sin Asignar"
                                            value={statistics.solicitudesSinAsignar}
                                            valueStyle={{ color: '#faad14' }}
                                        />
                                    </Col>
                                </Row>
                                <Divider style={{ margin: '12px 0' }} />
                                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                    {/* Simple representation of estados distribution */}
                                    {estados.map(estado => {
                                        const count = statistics.solicitudesByEstado[estado.codigo] || 0;
                                        const percentage = statistics.totalSolicitudes ? Math.round((count / statistics.totalSolicitudes) * 100) : 0;
                                        return (
                                            <div key={estado.id} style={{ marginBottom: '8px' }}>
                                                <Space>
                                                    <Tag color={getStatusColor(estado.codigo)}>{estado.nombre}</Tag>
                                                    <Text>{count} ({percentage}%)</Text>
                                                </Space>
                                                <Progress
                                                    percent={percentage}
                                                    showInfo={false}
                                                    strokeColor={getStatusColor(estado.codigo)}
                                                    size="small"
                                                />
                                            </div>
                                        );
                                    })}
                                    {estados.length === 0 && (
                                        <Text type="secondary">No hay datos de estados disponibles</Text>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Rest of the dashboard components... */}
                    {/* Filters */}
                    <Card title="Filtros" style={{ marginTop: 16 }}>
                        <Row gutter={16}>
                            <Col xs={24} sm={6}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Estado"
                                    value={filters.estado}
                                    onChange={(value) => handleFilterChange('estado', value)}
                                >
                                    <Option value="all">Todos los estados</Option>
                                    {estados.map(estado => (
                                        <Option key={estado.id} value={estado.codigo}>
                                            {estado.nombre}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Técnico"
                                    value={filters.tecnico}
                                    onChange={(value) => handleFilterChange('tecnico', value)}
                                >
                                    <Option value="all">Todos los técnicos</Option>
                                    <Option value="assigned">Con técnico asignado</Option>
                                    <Option value="unassigned">Sin técnico asignado</Option>
                                    {tecnicos.map(tecnico => (
                                        <Option key={tecnico.id} value={tecnico.id}>
                                            {tecnico.nombre_completo}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={6}>
                                <RangePicker
                                    style={{ width: '100%' }}
                                    onChange={(dates) => handleFilterChange('dateRange', dates)}
                                    value={filters.dateRange}
                                />
                            </Col>
                            <Col xs={24} sm={6}>
                                <Input
                                    placeholder="Buscar en solicitudes"
                                    prefix={<SearchOutlined />}
                                    value={filters.searchText}
                                    onChange={(e) => handleFilterChange('searchText', e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row justify="end" style={{ marginTop: 16 }}>
                            <Button icon={<FilterOutlined />} onClick={resetFilters}>
                                Resetear Filtros
                            </Button>
                        </Row>
                    </Card>

                    {/* Solicitudes Table */}
                    <Card title="Listado de Solicitudes" style={{ marginTop: 16 }}>
                        <Table
                            dataSource={getFilteredSolicitudes()}
                            rowKey="id"
                            columns={[
                                {
                                    title: 'ID',
                                    dataIndex: 'id',
                                    key: 'id',
                                    width: 120
                                },
                                {
                                    title: 'Cliente',
                                    dataIndex: 'nomaux',
                                    key: 'nomaux',
                                    render: (text, record) => (
                                        <span>{record.nomaux || record.codaux || 'N/A'}</span>
                                    )
                                },
                                {
                                    title: 'Motivo',
                                    dataIndex: 'desc_motivo',
                                    key: 'desc_motivo',
                                    ellipsis: true
                                },
                                {
                                    title: 'Estado',
                                    dataIndex: 'estado',
                                    key: 'estado',
                                    render: (estado) => {
                                        const estadoInfo = estados.find(e => e.codigo === estado) || {};
                                        return (
                                            <Tag color={getStatusColor(estado)}>
                                                {estadoInfo.nombre || estado}
                                            </Tag>
                                        );
                                    },
                                    width: 120
                                },
                                {
                                    title: 'Técnico',
                                    dataIndex: 'tecnico_asignado',
                                    key: 'tecnico_asignado',
                                    render: (tecnicoId) => {
                                        if (!tecnicoId) return <Tag color="orange">Sin asignar</Tag>;
                                        const tecnico = tecnicos.find(t => t.id === tecnicoId);
                                        return tecnico ? tecnico.nombre_completo : `Técnico #${tecnicoId}`;
                                    },
                                    width: 150
                                },
                                {
                                    title: 'Fecha',
                                    dataIndex: 'fecha',
                                    key: 'fecha',
                                    render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : 'N/A',
                                    width: 120
                                }
                            ]}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                {/* Other tabs remain unchanged */}
                <TabPane
                    tab={<span><TeamOutlined /> Técnicos</span>}
                    key="2"
                >
                    {/* Tecnicos Dashboard */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Card title="Técnicos por Especialidad">
                                {Object.entries(statistics.tecnicosByEspecialidad).map(([especialidad, count], index) => (
                                    <div key={index} style={{ marginBottom: 12 }}>
                                        <Text strong>{especialidad}:</Text> {count} técnicos
                                        <Progress
                                            percent={Math.round((count / statistics.tecnicosActivos) * 100)}
                                            size="small"
                                        />
                                    </div>
                                ))}
                                {Object.keys(statistics.tecnicosByEspecialidad).length === 0 && (
                                    <Text type="secondary">No hay datos de especialidades disponibles</Text>
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card title="Distribución de Solicitudes">
                                <Row gutter={[8, 16]}>
                                    {tecnicos.slice(0, 5).map(tecnico => {
                                        const solicitudesCount = solicitudes.filter(s => s.tecnico_asignado === tecnico.id).length;
                                        return (
                                            <Col span={24} key={tecnico.id}>
                                                <Tooltip title={`${solicitudesCount} solicitudes asignadas`}>
                                                    <div>
                                                        <Space>
                                                            <Badge
                                                                status={solicitudesCount > 0 ? "processing" : "default"}
                                                            />
                                                            <Text>{tecnico.nombre_completo}</Text>
                                                        </Space>
                                                        <Progress
                                                            percent={Math.round((solicitudesCount / (statistics.totalSolicitudes || 1)) * 100)}
                                                            size="small"
                                                            strokeColor={solicitudesCount > 5 ? "#ff4d4f" : "#1890ff"}
                                                        />
                                                    </div>
                                                </Tooltip>
                                            </Col>
                                        );
                                    })}
                                    {tecnicos.length > 5 && (
                                        <Col span={24}>
                                            <Text type="secondary">...y {tecnicos.length - 5} técnicos más</Text>
                                        </Col>
                                    )}
                                    {tecnicos.length === 0 && (
                                        <Col span={24}>
                                            <Text type="secondary">No hay datos de técnicos disponibles</Text>
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    {/* Tecnicos Table */}
                    <Card title="Listado de Técnicos" style={{ marginTop: 16 }}>
                        <Table
                            dataSource={tecnicos}
                            rowKey="id"
                            columns={[
                                {
                                    title: 'ID',
                                    dataIndex: 'id',
                                    key: 'id',
                                    width: 80
                                },
                                {
                                    title: 'Nombre',
                                    dataIndex: 'nombre_completo',
                                    key: 'nombre_completo'
                                },
                                {
                                    title: 'Email',
                                    dataIndex: 'email',
                                    key: 'email'
                                },
                                {
                                    title: 'Especialidad',
                                    dataIndex: 'especialidad',
                                    key: 'especialidad',
                                    render: (especialidad) => (
                                        <Tag color="blue">{especialidad || 'No especificada'}</Tag>
                                    ),
                                    width: 150
                                },
                                {
                                    title: 'Tipo',
                                    dataIndex: 'tipo_tecnico',
                                    key: 'tipo_tecnico',
                                    render: (tipo) => (
                                        <Tag color={tipo === 'Interno' ? 'green' : 'orange'}>
                                            {tipo || 'No especificado'}
                                        </Tag>
                                    ),
                                    width: 120
                                },
                                {
                                    title: 'Solicitudes',
                                    key: 'solicitudes',
                                    render: (_, record) => {
                                        const solicitudesCount = solicitudes.filter(s => s.tecnico_asignado === record.id).length;
                                        return solicitudesCount;
                                    },
                                    width: 120
                                }
                            ]}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                <TabPane
                    tab={<span><DatabaseOutlined /> Inventario</span>}
                    key="3"
                >
                    {/* Inventory Dashboard */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Card title="Repuestos con Stock Bajo" style={{ height: '100%' }}>
                                <Table
                                    dataSource={statistics.lowStockItems}
                                    columns={[
                                        { title: "Código", dataIndex: "codigo", key: "codigo", width: 100 },
                                        { title: "Descripción", dataIndex: "descripcion", key: "descripcion", ellipsis: true },
                                        {
                                            title: "Stock",
                                            dataIndex: "stock",
                                            key: "stock",
                                            render: stock => <Text style={{ color: "red" }}>{stock}</Text>,
                                            width: 80
                                        }
                                    ]}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    locale={{ emptyText: "No hay repuestos con stock bajo" }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title="Valor de Inventario" style={{ height: '100%' }}>
                                <Statistic
                                    title="Valor Total Estimado"
                                    value={inventory.reduce((sum, item) => sum + ((item.valor || 0) * (item.stock || 0)), 0)}
                                    precision={0}
                                    prefix={<DollarOutlined />}
                                    suffix="CLP"
                                />
                                <Divider style={{ margin: '12px 0' }} />
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Repuesto Más Costoso"
                                            value={inventory.length ? Math.max(...inventory.map(item => item.valor || 0)) : 0}
                                            precision={0}
                                            prefix={<DollarOutlined />}
                                            suffix="CLP"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Promedio por Repuesto"
                                            value={inventory.length ? inventory.reduce((sum, item) => sum + (item.valor || 0), 0) / inventory.length : 0}
                                            precision={0}
                                            prefix={<DollarOutlined />}
                                            suffix="CLP"
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    {/* Inventory Table */}
                    <Card title="Listado de Inventario" style={{ marginTop: 16 }}>
                        <Table
                            dataSource={inventory}
                            rowKey="id"
                            columns={[
                                {
                                    title: 'Código',
                                    dataIndex: 'codigo',
                                    key: 'codigo',
                                    width: 100
                                },
                                {
                                    title: 'Descripción',
                                    dataIndex: 'descripcion',
                                    key: 'descripcion',
                                    ellipsis: true
                                },
                                {
                                    title: 'Ubicación',
                                    dataIndex: 'ubicacion',
                                    key: 'ubicacion',
                                    width: 120
                                },
                                {
                                    title: 'Stock',
                                    dataIndex: 'stock',
                                    key: 'stock',
                                    render: (stock) => (
                                        <Text style={{ color: stock < 5 ? 'red' : 'inherit' }}>
                                            {stock}
                                        </Text>
                                    ),
                                    width: 80
                                },
                                {
                                    title: 'Valor',
                                    dataIndex: 'valor',
                                    key: 'valor',
                                    render: (valor) => `$${valor?.toLocaleString() || 0}`,
                                    width: 100
                                },
                                {
                                    title: 'Valor Total',
                                    key: 'valorTotal',
                                    render: (_, record) => `$${((record.valor || 0) * (record.stock || 0)).toLocaleString()}`,
                                    width: 120
                                }
                            ]}
                            pagination={{ pageSize: 10 }}
                            locale={{ emptyText: "No hay datos de inventario disponibles" }}
                        />
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Dashboard;