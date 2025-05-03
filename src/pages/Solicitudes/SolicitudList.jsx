import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Input, Card, Empty, Select, Row, Col, Tag, Badge, Tooltip, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, FilterOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';
import clienteService from '../../services/clienteService';
import { formatRut, REGIONES, getPrioridadColor, getColorByEstadoNombre, garantiaActiva } from './constants';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const SolicitudList = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searching, setSearching] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
    });
    const [tecnicos, setTecnicos] = useState({});
    const [tecnicosList, setTecnicosList] = useState([]);
    const [loadingTecnicos, setLoadingTecnicos] = useState(false);
    const [estados, setEstados] = useState({});
    const [estadosList, setEstadosList] = useState([]);
    const [loadingEstados, setLoadingEstados] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        tecnicoId: undefined,
        estadoId: undefined,
        prioridad: undefined,
        ejecucion: undefined,
        tipo_cliente: undefined,
        facturable: undefined,
        fecha_agendamiento_desde: undefined,
        fecha_agendamiento_hasta: undefined,
        cliente: undefined,
        cliente_contactado: undefined,
        distribuidor_contactado: undefined,
        tecnico_confirmado: undefined,
        reporte_enviado: undefined,
        codprod: undefined,
        desprod: undefined
    });
    const [clientesList, setClientesList] = useState([]);
    const [loadingClientes, setLoadingClientes] = useState(false);

    // Cargar técnicos, estados y clientes
    useEffect(() => {
        Promise.all([
            fetchTecnicos(),
            fetchEstados(),
            fetchClientes(),
            fetchSolicitudes(1, pagination.pageSize)
        ]);
    }, []);

    const fetchTecnicos = async () => {
        try {
            setLoadingTecnicos(true);
            const response = await tecnicoService.getTecnicos();

            if (response?.data?.success && Array.isArray(response.data.tecnicos)) {
                setTecnicosList(response.data.tecnicos);

                const tecnicosMap = {};
                response.data.tecnicos.forEach(tecnico => {
                    if (tecnico && tecnico.id) {
                        tecnicosMap[tecnico.id] = tecnico;
                    }
                });
                setTecnicos(tecnicosMap);
            } else {
                setTecnicosList([]);
                setTecnicos({});
            }
        } catch (error) {
            console.error('Error al cargar técnicos:', error);
            setTecnicosList([]);
            setTecnicos({});
        } finally {
            setLoadingTecnicos(false);
        }
    };

    const fetchEstados = async () => {
        try {
            setLoadingEstados(true);
            const response = await estadoSolicitudService.getEstados();

            if (response?.data?.success && Array.isArray(response.data.estados)) {
                setEstadosList(response.data.estados);

                const estadosMap = {};
                response.data.estados.forEach(estado => {
                    if (estado && estado.id) {
                        estadosMap[estado.id] = estado;
                    }
                });
                setEstados(estadosMap);
            } else {
                setEstadosList([]);
                setEstados({});
            }
        } catch (error) {
            console.error('Error al cargar estados:', error);
            setEstadosList([]);
            setEstados({});
        } finally {
            setLoadingEstados(false);
        }
    };

    const fetchClientes = async () => {
        try {
            setLoadingClientes(true);
            const response = await clienteService.getAllClientes(1, 100, true);

            if (response?.data?.success && Array.isArray(response.data.clientes)) {
                const clientes = response.data.clientes.map(cliente => ({
                    id: cliente.codaux,
                    nombre: cliente.nomaux,
                    rut: formatRut(cliente.codaux)
                }));
                setClientesList(clientes);
            } else {
                setClientesList([]);
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            setClientesList([]);
        } finally {
            setLoadingClientes(false);
        }
    };

    const fetchSolicitudes = async (page = 1, pageSize = pagination.pageSize) => {
        try {
            setLoading(true);
            const response = await solicitudService.getAllSolicitudes(page, pageSize);

            if (response?.data?.success) {
                setSolicitudes(response.data.solicitudes || []);

                if (response.data.pagination) {
                    setPagination({
                        ...pagination,
                        current: page,
                        pageSize: pageSize,
                        total: response.data.pagination.total || 0,
                    });
                }
            } else {
                message.error(response?.data?.message || 'Error al cargar las solicitudes');
                setSolicitudes([]);
            }
        } catch (error) {
            console.error('Error al obtener solicitudes:', error);
            message.error('Error al cargar las solicitudes');
            setSolicitudes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setFilters({
                ...filters,
                fecha_agendamiento_desde: dates[0].format('YYYY-MM-DD'),
                fecha_agendamiento_hasta: dates[1].format('YYYY-MM-DD')
            });
        } else {
            setFilters({
                ...filters,
                fecha_agendamiento_desde: undefined,
                fecha_agendamiento_hasta: undefined
            });
        }
    };

    const handleSearch = async () => {
        if (!searchText.trim() && !Object.values(filters).some(value => value !== undefined && value !== '')) {
            fetchSolicitudes(1, pagination.pageSize);
            return;
        }

        try {
            setSearching(true);
            setLoading(true);

            const searchParams = {
                searchText: searchText,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
                )
            };

            const response = await solicitudService.searchSolicitudes(searchParams);

            if (response?.data?.success) {
                setSolicitudes(response.data.solicitudes || []);
                setPagination({
                    ...pagination,
                    current: 1,
                    total: response.data.count || 0,
                });
                message.success(`Se encontraron ${response.data.count || 0} resultados`);
            } else {
                message.error(response?.data?.message || 'Error al realizar la búsqueda');
                setSolicitudes([]);
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            message.error('Error al realizar la búsqueda');
            setSolicitudes([]);
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    const resetSearch = () => {
        setSearchText('');
        setFilters({
            tecnicoId: undefined,
            estadoId: undefined,
            prioridad: undefined,
            ejecucion: undefined,
            tipo_cliente: undefined,
            facturable: undefined,
            fecha_agendamiento_desde: undefined,
            fecha_agendamiento_hasta: undefined,
            cliente: undefined,
            cliente_contactado: undefined,
            distribuidor_contactado: undefined,
            tecnico_confirmado: undefined,
            reporte_enviado: undefined,
            codprod: undefined,
            desprod: undefined
        });
        setSearching(false);
        fetchSolicitudes(1, pagination.pageSize);
    };

    const handleTableChange = (newPagination) => {
        if (searching) return;
        fetchSolicitudes(newPagination.current, newPagination.pageSize);
    };

    const renderSeguimientoTag = (value) => {
        if (value === 'S') return <Badge status="success" text="Sí" />;
        if (value === 'N') return <Badge status="error" text="No" />;
        return <Badge status="default" text="N/D" />;
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => (a.id || 0) - (b.id || 0),
        },
        {
            title: 'Cliente',
            key: 'cliente',
            width: 180,
            render: (record) => (
                <div>
                    <div>{record.nomaux || 'N/A'}</div>
                    {record.codaux && <small style={{ color: '#888' }}>RUT: {formatRut(record.codaux)}</small>}
                    {record.tipo_cliente && <div><Tag size="small">{record.tipo_cliente}</Tag></div>}
                </div>
            ),
            sorter: (a, b) => (a.nomaux || '').localeCompare(b.nomaux || ''),
            filters: clientesList.map(cliente => ({
                text: `${cliente.nombre} (${cliente.rut})`,
                value: cliente.id
            })),
            onFilter: (value, record) => record.codaux === value,
        },
        {
            title: 'Descripción',
            key: 'descripcion',
            ellipsis: true,
            width: 180,
            render: (record) => (
                <div>
                    <div style={{ marginBottom: 5 }}>{record.desc_motivo || 'N/A'}</div>
                    {record.codprod && <div><small>Código: {record.codprod}</small></div>}
                    {record.desprod && <div><small>Producto: {record.desprod}</small></div>}
                </div>
            )
        },
        {
            title: 'Fecha',
            key: 'fecha',
            width: 120,
            render: (record) => {
                const hasFecha = !!record.fecha;
                const hasFactura = !!record.fecha_fact;
                const isGarantiaActiva = hasFactura ? garantiaActiva(record.fecha_fact) : false;

                return (
                    <div>
                        <div>{hasFecha ? new Date(record.fecha).toLocaleDateString() : 'N/A'}</div>
                        {hasFactura && (
                            <Tooltip title={isGarantiaActiva ? "Garantía activa" : "Garantía vencida"}>
                                <Badge
                                    status={isGarantiaActiva ? "success" : "error"}
                                    text={<small style={{ color: '#888' }}>Fact: {new Date(record.fecha_fact).toLocaleDateString()}</small>}
                                />
                            </Tooltip>
                        )}
                        {record.fecha_agendamiento && (
                            <Tooltip title="Fecha agendada">
                                <div>
                                    <CalendarOutlined style={{ color: '#1890ff', marginRight: 5 }} />
                                    <small style={{ color: '#1890ff' }}>{new Date(record.fecha_agendamiento).toLocaleDateString()}</small>
                                </div>
                            </Tooltip>
                        )}
                    </div>
                );
            },
            sorter: (a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0),
        },
        {
            title: 'Ubicación',
            key: 'ubicacion',
            width: 120,
            render: (record) => {
                const regionNombre = record.region ? REGIONES[record.region] || `Región ${record.region}` : 'N/A';
                const areaTrabajo = record.area_trab ? (record.area_trab === 'PLANTA' ? 'Taller' : record.area_trab) : 'N/A';

                return (
                    <div>
                        <div><Tag color="blue">{areaTrabajo}</Tag></div>
                        <Tooltip title={regionNombre}>
                            <small style={{ color: '#888' }}>{regionNombre.substring(0, 15)}...</small>
                        </Tooltip>
                    </div>
                );
            },
        },
        {
            title: 'Seguimiento',
            key: 'seguimiento',
            width: 120,
            render: (record) => (
                <div>
                    <div><Tooltip title="Cliente Contactado"><span>C: {renderSeguimientoTag(record.cliente_contactado)}</span></Tooltip></div>
                    <div><Tooltip title="Distribuidor Contactado"><span>D: {renderSeguimientoTag(record.distribuidor_contactado)}</span></Tooltip></div>
                    <div><Tooltip title="Técnico Confirmado"><span>T: {renderSeguimientoTag(record.tecnico_confirmado)}</span></Tooltip></div>
                    <div><Tooltip title="Reporte Enviado"><span>R: {renderSeguimientoTag(record.reporte_enviado)}</span></Tooltip></div>
                </div>
            ),
            filters: [
                { text: 'Cliente Contactado - Sí', value: 'cliente_contactado=S' },
                { text: 'Cliente Contactado - No', value: 'cliente_contactado=N' },
                { text: 'Distribuidor Contactado - Sí', value: 'distribuidor_contactado=S' },
                { text: 'Distribuidor Contactado - No', value: 'distribuidor_contactado=N' },
                { text: 'Técnico Confirmado - Sí', value: 'tecnico_confirmado=S' },
                { text: 'Técnico Confirmado - No', value: 'tecnico_confirmado=N' },
                { text: 'Reporte Enviado - Sí', value: 'reporte_enviado=S' },
                { text: 'Reporte Enviado - No', value: 'reporte_enviado=N' },
            ],
            onFilter: (value, record) => {
                const [campo, estado] = value.split('=');
                return record[campo] === estado;
            },
        },
        {
            title: 'Prioridad',
            key: 'prioridad',
            width: 100,
            render: (record) => {
                if (!record.prioridad) return 'No definida';
                return <Tag color={getPrioridadColor(record.prioridad)}>{record.prioridad}</Tag>;
            },
            filters: [
                { text: 'Normal', value: 'Normal' },
                { text: 'Urgente', value: 'Urgente' },
                { text: 'Atrasada', value: 'Atrasado' }
            ],
            onFilter: (value, record) => record.prioridad === value
        },
        {
            title: 'Estado',
            key: 'estado',
            width: 130,
            render: (record) => {
                try {
                    // Estado desde tabla estado_solicitud
                    if (record.estado_id) {
                        const estado = estados[record.estado_id];
                        if (!estado) return `ID: ${record.estado_id}`;

                        return (
                            <div>
                                <Tag color={getColorByEstadoNombre(estado.nombre)}>
                                    {estado.nombre || `Estado ${record.estado_id}`}
                                </Tag>
                                {record.ejecucion && <div style={{ marginTop: 4 }}><small>{record.ejecucion}</small></div>}
                            </div>
                        );
                    }
                    // Estado antiguo
                    else if (record.estado) {
                        const estadoMap = {
                            'AP': { text: 'Aprobada', color: 'green' },
                            'PE': { text: 'Pendiente', color: 'orange' },
                            'CA': { text: 'Cancelada', color: 'red' },
                            'FI': { text: 'Finalizada', color: 'blue' }
                        };
                        const estadoInfo = estadoMap[record.estado] || { text: record.estado, color: 'default' };
                        return (
                            <div>
                                <Tag color={estadoInfo.color}>{estadoInfo.text}</Tag>
                                {record.ejecucion && <div style={{ marginTop: 4 }}><small>{record.ejecucion}</small></div>}
                            </div>
                        );
                    }
                    return 'No asignado';
                } catch (error) {
                    return 'Error';
                }
            },
        },
        {
            title: 'Técnico',
            key: 'tecnico_asignado',
            width: 150,
            render: (record) => {
                try {
                    if (!record.tecnico_asignado) return 'No asignado';
                    const tecnico = tecnicos[record.tecnico_asignado];
                    if (!tecnico) return `ID: ${record.tecnico_asignado}`;
                    return (
                        <div>
                            <div>{tecnico.nombre_completo || `Técnico ${record.tecnico_asignado}`}</div>
                            <Tag size="small" color={tecnico.tipo_tecnico === 'Interno' ? 'green' : 'orange'}>
                                {tecnico.tipo_tecnico || 'Sin tipo'}
                            </Tag>
                        </div>
                    );
                } catch (error) {
                    return 'Error';
                }
            },
        },
        {
            title: 'Acciones',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Link to={`/solicitudes/${record.id}`}>
                        <Button type="primary" size="small" icon={<EyeOutlined />}>Ver</Button>
                    </Link>
                    <Link to={`/solicitudes/edit/${record.id}`}>
                        <Button size="small" icon={<EditOutlined />}>Editar</Button>
                    </Link>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Solicitudes de Servicio</Title>
                <Space>
                    <Link to="/solicitudes/create">
                        <Button type="primary" icon={<PlusOutlined />}>Nueva Solicitud</Button>
                    </Link>
                </Space>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: '100%', marginBottom: 16 }}>
                    <Input
                        placeholder="Buscar en todos los campos (ID, cliente, descripción, etc.)"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 500 }}
                        allowClear
                    />
                    <Button type="primary" onClick={handleSearch} loading={searching}>Buscar</Button>
                    <Button onClick={resetSearch} icon={<ReloadOutlined />}>Restablecer</Button>
                    <Button
                        icon={<FilterOutlined />}
                        onClick={() => setShowFilters(!showFilters)}
                        type={showFilters ? 'primary' : 'default'}
                    >
                        Filtros
                    </Button>
                </Space>

                {showFilters && (
                    <div>
                        <Row gutter={[16, 16]} style={{ marginTop: 8, marginBottom: 8 }}>
                            {/* Cliente */}
                            <Col xs={24} lg={8}>
                                <Select
                                    placeholder="Filtrar por cliente"
                                    style={{ width: '100%' }}
                                    value={filters.cliente}
                                    onChange={(value) => setFilters({ ...filters, cliente: value })}
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    loading={loadingClientes}
                                >
                                    {clientesList.map(cliente => (
                                        <Option key={cliente.id} value={cliente.id}>
                                            {cliente.nombre} ({cliente.rut})
                                        </Option>
                                    ))}
                                </Select>
                            </Col>

                            {/* Técnico */}
                            <Col xs={24} lg={8}>
                                <Select
                                    placeholder="Filtrar por técnico"
                                    style={{ width: '100%' }}
                                    value={filters.tecnicoId}
                                    onChange={(value) => setFilters({ ...filters, tecnicoId: value })}
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    loading={loadingTecnicos}
                                >
                                    {tecnicosList.map(tecnico => (
                                        <Option key={tecnico.id} value={tecnico.id}>
                                            {tecnico.nombre_completo || `Técnico ${tecnico.id}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>

                            {/* Estado */}
                            <Col xs={24} lg={8}>
                                <Select
                                    placeholder="Filtrar por estado"
                                    style={{ width: '100%' }}
                                    value={filters.estadoId}
                                    onChange={(value) => setFilters({ ...filters, estadoId: value })}
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    loading={loadingEstados}
                                >
                                    {estadosList.map(estado => (
                                        <Option key={estado.id} value={estado.id}>
                                            {estado.nombre || `Estado ${estado.id}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>

                            {/* Filtros adicionales */}
                            <Col xs={24} lg={8}>
                                <Select
                                    placeholder="Filtrar por prioridad"
                                    style={{ width: '100%' }}
                                    value={filters.prioridad}
                                    onChange={(value) => setFilters({ ...filters, prioridad: value })}
                                    allowClear
                                >
                                    <Option value="Normal">Normal</Option>
                                    <Option value="Urgente">Urgente</Option>
                                    <Option value="Atrasado">Atrasada</Option>
                                </Select>
                            </Col>
                            <Col xs={24} lg={8}>
                                <Select
                                    placeholder="Filtrar por tipo de cliente"
                                    style={{ width: '100%' }}
                                    value={filters.tipo_cliente}
                                    onChange={(value) => setFilters({ ...filters, tipo_cliente: value })}
                                    allowClear
                                >
                                    <Option value="Final">Final</Option>
                                    <Option value="Retail">Retail</Option>
                                    <Option value="Distribuidor">Distribuidor</Option>
                                </Select>
                            </Col>

                            {/* Seguimiento */}
                            <Col xs={24} lg={12}>
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Select
                                            placeholder="Cliente contactado"
                                            style={{ width: '100%' }}
                                            value={filters.cliente_contactado}
                                            onChange={(value) => setFilters({ ...filters, cliente_contactado: value })}
                                            allowClear
                                        >
                                            <Option value="S">Sí</Option>
                                            <Option value="N">No</Option>
                                        </Select>
                                    </Col>
                                    <Col span={12}>
                                        <Select
                                            placeholder="Técnico confirmado"
                                            style={{ width: '100%' }}
                                            value={filters.tecnico_confirmado}
                                            onChange={(value) => setFilters({ ...filters, tecnico_confirmado: value })}
                                            allowClear
                                        >
                                            <Option value="S">Sí</Option>
                                            <Option value="N">No</Option>
                                        </Select>
                                    </Col>
                                </Row>
                            </Col>

                            {/* Fecha agendamiento */}
                            <Col xs={24} lg={12}>
                                <RangePicker
                                    style={{ width: '100%' }}
                                    placeholder={['Fecha agendamiento desde', 'Fecha agendamiento hasta']}
                                    onChange={handleDateRangeChange}
                                    format="YYYY-MM-DD"
                                />
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>

            <Table
                columns={columns}
                dataSource={solicitudes}
                rowKey="id"
                loading={loading || loadingTecnicos || loadingEstados || loadingClientes}
                pagination={searching ? false : pagination}
                onChange={handleTableChange}
                scroll={{ x: 1100 }}
                locale={{ emptyText: <Empty description="No hay solicitudes disponibles" /> }}
            />
        </div>
    );
};

export default SolicitudList;