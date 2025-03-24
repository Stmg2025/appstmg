import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Input, Card, Empty, Select, Row, Col, Tag } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';

const { Title } = Typography;
const { Option } = Select;

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
                    // Lista completa de técnicos para el filtro
                    setTecnicosList(response.data.tecnicos);

                    // Crear un objeto con id como clave y técnico como valor para búsqueda rápida
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
                console.log('Respuesta de estados:', response?.data);

                if (response?.data?.success && Array.isArray(response.data.estados)) {
                    // Lista completa de estados para el filtro
                    setEstadosList(response.data.estados);

                    // Crear un objeto con id como clave y estado como valor para búsqueda rápida
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

            // Parámetros de búsqueda
            const searchParams = {
                searchText: searchText
            };

            // Añadir filtros de técnicos
            if (filters.tecnicoId) {
                searchParams.tecnicoId = filters.tecnicoId;
            }

            if (filters.asignacionTecnico) {
                searchParams.asignacionTecnico = filters.asignacionTecnico;
            }

            if (filters.tipoTecnico) {
                searchParams.tipoTecnico = filters.tipoTecnico;
            }

            // Añadir filtros de estados
            if (filters.estadoId) {
                searchParams.estadoId = filters.estadoId;
            }

            if (filters.asignacionEstado) {
                searchParams.asignacionEstado = filters.asignacionEstado;
            }

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

                // Actualizamos la paginación con los resultados de búsqueda
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
            dataIndex: 'nomaux',
            key: 'nomaux',
            width: 150,
            render: (text) => text || 'N/A',
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
            width: 300,
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            width: 100,
            render: (fecha) => {
                try {
                    return fecha ? new Date(fecha).toLocaleDateString() : 'N/A';
                } catch (error) {
                    return 'Fecha inválida';
                }
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
            title: 'Estado',
            dataIndex: 'estado_id',
            key: 'estado_id',
            width: 120,
            render: (estadoId, record) => {
                try {
                    // Mostrar el estado de la tabla estado_solicitud si existe
                    if (estadoId) {
                        const estado = estados[estadoId];
                        if (!estado) return `ID: ${estadoId}`;

                        return (
                            <Tag color={getColorByEstadoNombre(estado.nombre)}>
                                {estado.nombre || `Estado ${estadoId}`}
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
            dataIndex: 'tecnico_asignado',
            key: 'tecnico_asignado',
            width: 150,
            render: (tecnicoId) => {
                try {
                    if (!tecnicoId) return 'No asignado';
                    const tecnico = tecnicos[tecnicoId];
                    if (!tecnico) return `ID: ${tecnicoId}`;
                    return (
                        <div>
                            <div>{tecnico.nombre_completo || `Técnico ${tecnicoId}`}</div>
                            <small>{tecnico.tipo_tecnico || 'Sin tipo'}</small>
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