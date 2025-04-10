import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Input, Card, Empty, Select, Row, Col, Tag, Badge, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, FilterOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';

const { Title } = Typography;
const { Option } = Select;

// Mapeo de regiones
const REGIONES = {
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
    '15': 'Decimoquinta Región de Arica y Parinacota'
};

// Función para formatear RUT chileno
const formatRut = (rut) => {
    if (!rut) return 'N/A';

    // Calcular dígito verificador
    const calcularDV = (rutNum) => {
        let suma = 0;
        let multiplo = 2;

        for (let i = rutNum.length - 1; i >= 0; i--) {
            suma += parseInt(rutNum.charAt(i)) * multiplo;
            multiplo = multiplo < 7 ? multiplo + 1 : 2;
        }

        let dvCalculado = 11 - (suma % 11);

        if (dvCalculado === 11) return '0';
        if (dvCalculado === 10) return 'K';

        return dvCalculado.toString();
    };

    // Formatear RUT con puntos y guión
    let rutFormateado = '';
    const dv = calcularDV(rut);

    for (let i = rut.length - 1; i >= 0; i--) {
        rutFormateado = rut.charAt(i) + rutFormateado;
        if ((rut.length - i) % 3 === 0 && i !== 0) {
            rutFormateado = '.' + rutFormateado;
        }
    }

    return rutFormateado + '-' + dv;
};

// Función para verificar si la garantía está activa (1 año desde la fecha de factura)
const garantiaActiva = (fechaFactura) => {
    if (!fechaFactura) return false;

    const fechaLimite = moment(fechaFactura).add(1, 'year');
    return moment().isBefore(fechaLimite);
};

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
        asignacionTecnico: undefined,
        tipoTecnico: undefined,
        estadoId: undefined,
        asignacionEstado: undefined
    });

    // Cargar técnicos para mostrar nombres en lugar de IDs
    useEffect(() => {
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
                    console.warn('Formato de respuesta de técnicos inválido:', response?.data);
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

        fetchTecnicos();
    }, []);

    // Cargar estados para mostrar nombres en lugar de IDs
    useEffect(() => {
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
                    console.warn('Formato de respuesta de estados inválido:', response?.data);
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

        fetchEstados();
    }, []);

    useEffect(() => {
        fetchSolicitudes(1, pagination.pageSize);
    }, []);

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

    const handleSearch = async () => {
        if (!searchText.trim() && !filters.tecnicoId && !filters.asignacionTecnico
            && !filters.tipoTecnico && !filters.estadoId && !filters.asignacionEstado) {
            fetchSolicitudes(1, pagination.pageSize);
            return;
        }

        try {
            setSearching(true);
            setLoading(true);

            const searchParams = {
                searchText: searchText
            };

            // Añadir filtros de técnicos
            if (filters.tecnicoId) searchParams.tecnicoId = filters.tecnicoId;
            if (filters.asignacionTecnico) searchParams.asignacionTecnico = filters.asignacionTecnico;
            if (filters.tipoTecnico) searchParams.tipoTecnico = filters.tipoTecnico;

            // Añadir filtros de estados
            if (filters.estadoId) searchParams.estadoId = filters.estadoId;
            if (filters.asignacionEstado) searchParams.asignacionEstado = filters.asignacionEstado;

            const response = await solicitudService.searchSolicitudes(searchParams);

            if (response?.data?.success) {
                let filteredResults = response.data.solicitudes || [];

                // Aplicar filtros de técnicos en el cliente (por si el backend no lo soporta)
                if (filters.tecnicoId && filteredResults.length > 0) {
                    filteredResults = filteredResults.filter(s => s.tecnico_asignado === parseInt(filters.tecnicoId));
                }

                if (filters.asignacionTecnico && filteredResults.length > 0) {
                    if (filters.asignacionTecnico === 'con') {
                        filteredResults = filteredResults.filter(s => s.tecnico_asignado);
                    } else if (filters.asignacionTecnico === 'sin') {
                        filteredResults = filteredResults.filter(s => !s.tecnico_asignado);
                    }
                }

                if (filters.tipoTecnico && filteredResults.length > 0) {
                    filteredResults = filteredResults.filter(s => {
                        try {
                            if (!s.tecnico_asignado) return false;
                            const tecnico = tecnicos[s.tecnico_asignado];
                            return tecnico && tecnico.tipo_tecnico === filters.tipoTecnico;
                        } catch (error) {
                            console.error('Error en filtro de tipo de técnico:', error);
                            return false;
                        }
                    });
                }

                // Aplicar filtros de estados en el cliente
                if (filters.estadoId && filteredResults.length > 0) {
                    filteredResults = filteredResults.filter(s => s.estado_id === parseInt(filters.estadoId));
                }

                if (filters.asignacionEstado && filteredResults.length > 0) {
                    if (filters.asignacionEstado === 'con') {
                        filteredResults = filteredResults.filter(s => s.estado_id);
                    } else if (filters.asignacionEstado === 'sin') {
                        filteredResults = filteredResults.filter(s => !s.estado_id);
                    }
                }

                setSolicitudes(filteredResults);

                setPagination({
                    ...pagination,
                    current: 1,
                    total: filteredResults.length,
                });

                message.success(`Se encontraron ${filteredResults.length} resultados`);
            } else {
                message.error(response?.data?.message || 'Error al realizar la búsqueda');
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            message.error('Error al realizar la búsqueda');
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    const resetSearch = () => {
        setSearchText('');
        setFilters({
            tecnicoId: undefined,
            asignacionTecnico: undefined,
            tipoTecnico: undefined,
            estadoId: undefined,
            asignacionEstado: undefined
        });
        setSearching(false);
        fetchSolicitudes(1, pagination.pageSize);
    };

    const handleTableChange = (newPagination) => {
        if (searching) return;
        fetchSolicitudes(newPagination.current, newPagination.pageSize);
    };

    // Función para determinar el color del estado basado en su nombre
    const getColorByEstadoNombre = (nombre) => {
        try {
            const nombreLower = (nombre || '').toLowerCase();
            if (nombreLower.includes('pendiente')) return 'orange';
            if (nombreLower.includes('proceso') || nombreLower.includes('progreso')) return 'blue';
            if (nombreLower.includes('completa') || nombreLower.includes('finaliza') || nombreLower.includes('termina')) return 'green';
            if (nombreLower.includes('cancela') || nombreLower.includes('rechaza')) return 'red';
            return 'default';
        } catch (error) {
            console.error('Error al determinar color del estado:', error);
            return 'default';
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            sorter: (a, b) => {
                try {
                    return (a.id || 0) - (b.id || 0);
                } catch (error) {
                    return 0;
                }
            },
        },
        {
            title: 'Cliente',
            key: 'cliente',
            width: 200,
            render: (record) => {
                return (
                    <div>
                        <div>{record.nomaux || 'N/A'}</div>
                        {record.codaux && (
                            <small style={{ color: '#888' }}>RUT: {formatRut(record.codaux)}</small>
                        )}
                    </div>
                );
            },
            sorter: (a, b) => {
                try {
                    return (a.nomaux || '').localeCompare(b.nomaux || '');
                } catch (error) {
                    return 0;
                }
            },
        },
        {
            title: 'Descripción',
            dataIndex: 'desc_motivo',
            key: 'desc_motivo',
            ellipsis: true,
            width: 250,
        },
        {
            title: 'Fecha',
            key: 'fecha',
            width: 120,
            render: (record) => {
                const hasFecha = record.fecha ? true : false;
                const hasFactura = record.fecha_fact ? true : false;
                const isGarantiaActiva = hasFactura ? garantiaActiva(record.fecha_fact) : false;

                return (
                    <div>
                        <div>{hasFecha ? new Date(record.fecha).toLocaleDateString() : 'N/A'}</div>
                        {hasFactura && (
                            <Tooltip title={isGarantiaActiva ? "Garantía activa" : "Garantía vencida"}>
                                <Badge
                                    status={isGarantiaActiva ? "success" : "error"}
                                    text={
                                        <small style={{ color: '#888' }}>
                                            Fact: {new Date(record.fecha_fact).toLocaleDateString()}
                                        </small>
                                    }
                                />
                            </Tooltip>
                        )}
                    </div>
                );
            },
            sorter: (a, b) => {
                try {
                    return new Date(a.fecha || 0) - new Date(b.fecha || 0);
                } catch (error) {
                    return 0;
                }
            },
        },
        {
            title: 'Ubicación',
            key: 'ubicacion',
            width: 140,
            render: (record) => {
                const regionNombre = record.region ? REGIONES[record.region] || `Región ${record.region}` : 'N/A';
                const areaTrabajo = record.area_trab ?
                    (record.area_trab === 'PLANTA' ? 'Taller' : record.area_trab) : 'N/A';

                return (
                    <div>
                        <div>
                            <Tag color="blue">{areaTrabajo}</Tag>
                        </div>
                        <Tooltip title={regionNombre}>
                            <small style={{ color: '#888' }}>{regionNombre.substring(0, 15)}...</small>
                        </Tooltip>
                    </div>
                );
            },
        },
        {
            title: 'Estado',
            key: 'estado',
            width: 120,
            render: (record) => {
                try {
                    // Mostrar el estado de la tabla estado_solicitud si existe
                    if (record.estado_id) {
                        const estado = estados[record.estado_id];
                        if (!estado) return `ID: ${record.estado_id}`;

                        return (
                            <Tag color={getColorByEstadoNombre(estado.nombre)}>
                                {estado.nombre || `Estado ${record.estado_id}`}
                            </Tag>
                        );
                    }
                    // Si no hay estado_id, mostrar el estado antiguo
                    else if (record.estado) {
                        const estadoMap = {
                            'AP': { text: 'Aprobada', color: 'green' },
                            'PE': { text: 'Pendiente', color: 'orange' },
                            'CA': { text: 'Cancelada', color: 'red' },
                            'FI': { text: 'Finalizada', color: 'blue' }
                        };
                        const estadoInfo = estadoMap[record.estado] || { text: record.estado, color: 'default' };
                        return <Tag color={estadoInfo.color}>{estadoInfo.text}</Tag>;
                    }

                    return 'No asignado';
                } catch (error) {
                    console.error('Error al renderizar estado:', error);
                    return 'Error';
                }
            },
        },
        {
            title: 'Técnico Asignado',
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
                    console.error('Error al renderizar técnico:', error);
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
                        <Button type="primary" size="small" icon={<EyeOutlined />}>
                            Ver
                        </Button>
                    </Link>
                    <Link to={`/solicitudes/edit/${record.id}`}>
                        <Button size="small" icon={<EditOutlined />}>
                            Editar
                        </Button>
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
                        <Button type="primary" icon={<PlusOutlined />}>
                            Nueva Solicitud
                        </Button>
                    </Link>
                </Space>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: '100%', marginBottom: 16 }}>
                    <Input
                        placeholder="Buscar en todos los campos (ID, cliente, descripción, estado, etc.)"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 500 }}
                        allowClear
                    />
                    <Button
                        type="primary"
                        onClick={handleSearch}
                        loading={searching}
                    >
                        Buscar
                    </Button>
                    <Button
                        onClick={resetSearch}
                        icon={<ReloadOutlined />}
                    >
                        Restablecer
                    </Button>
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
                        <Row gutter={16} style={{ marginTop: 8, marginBottom: 8 }}>
                            <Col span={8}>
                                <Select
                                    placeholder="Filtrar por técnico"
                                    style={{ width: '100%' }}
                                    value={filters.tecnicoId}
                                    onChange={(value) => setFilters({ ...filters, tecnicoId: value })}
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    loading={loadingTecnicos}
                                    notFoundContent={loadingTecnicos ? <span>Cargando...</span> : <span>No hay técnicos disponibles</span>}
                                >
                                    {(tecnicosList || []).map(tecnico => (
                                        <Option key={tecnico.id} value={tecnico.id}>
                                            {tecnico.nombre_completo || `Técnico ${tecnico.id}`} - {tecnico.tipo_tecnico || 'Sin tipo'}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={8}>
                                <Select
                                    placeholder="Filtrar por asignación de técnico"
                                    style={{ width: '100%' }}
                                    value={filters.asignacionTecnico}
                                    onChange={(value) => setFilters({ ...filters, asignacionTecnico: value })}
                                    allowClear
                                >
                                    <Option value="con">Con técnico asignado</Option>
                                    <Option value="sin">Sin técnico asignado</Option>
                                </Select>
                            </Col>
                            <Col span={8}>
                                <Select
                                    placeholder="Filtrar por tipo de técnico"
                                    style={{ width: '100%' }}
                                    value={filters.tipoTecnico}
                                    onChange={(value) => setFilters({ ...filters, tipoTecnico: value })}
                                    allowClear
                                >
                                    <Option value="Interno">Técnicos internos</Option>
                                    <Option value="Externo">Técnicos externos</Option>
                                </Select>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 8 }}>
                            <Col span={8}>
                                <Select
                                    placeholder="Filtrar por estado"
                                    style={{ width: '100%' }}
                                    value={filters.estadoId}
                                    onChange={(value) => setFilters({ ...filters, estadoId: value })}
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    loading={loadingEstados}
                                    notFoundContent={loadingEstados ? <span>Cargando...</span> : <span>No hay estados disponibles</span>}
                                >
                                    {(estadosList || []).map(estado => (
                                        <Option key={estado.id} value={estado.id}>
                                            {estado.nombre || `Estado ${estado.id}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={8}>
                                <Select
                                    placeholder="Filtrar por asignación de estado"
                                    style={{ width: '100%' }}
                                    value={filters.asignacionEstado}
                                    onChange={(value) => setFilters({ ...filters, asignacionEstado: value })}
                                    allowClear
                                >
                                    <Option value="con">Con estado asignado</Option>
                                    <Option value="sin">Sin estado asignado</Option>
                                </Select>
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>

            <Table
                columns={columns}
                dataSource={solicitudes}
                rowKey="id"
                loading={loading || loadingTecnicos || loadingEstados}
                pagination={searching ? false : pagination}
                onChange={handleTableChange}
                scroll={{ x: 920 }}
                locale={{
                    emptyText: <Empty description="No hay solicitudes disponibles" />
                }}
            />
        </div>
    );
};

export default SolicitudList;