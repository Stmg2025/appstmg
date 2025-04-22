import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Input, Card, Empty, Select, Row, Col, Tag, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, FilterOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import clienteService from '../../services/clienteService';

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

// Función para calcular el dígito verificador de un RUT chileno
const calcularDV = (rutNum) => {
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

// Función para formatear RUT chileno
const formatRut = (rut) => {
    if (!rut) return 'N/A';

    // Limpiar: asegurar que es string y sin puntos ni guiones
    const rutLimpio = String(rut).replace(/\./g, '').replace(/-/g, '');

    // El codaux es el cuerpo del RUT, necesitamos calcular el DV
    const rutSinDV = rutLimpio; // Asumimos que codaux no incluye el DV

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

const ClienteList = () => {
    const [clientes, setClientes] = useState([]);
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
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        region: undefined,
        ciudad: undefined
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchClientes(1, pagination.pageSize);
    }, []);

    const fetchClientes = async (page = 1, pageSize = pagination.pageSize) => {
        try {
            setLoading(true);
            const response = await clienteService.getAllClientes(page, pageSize);

            if (response?.data?.success) {
                setClientes(response.data.clientes || []);

                if (response.data.pagination) {
                    setPagination({
                        ...pagination,
                        current: page,
                        pageSize: pageSize,
                        total: response.data.pagination.total || 0,
                    });
                }
            } else {
                message.error(response?.data?.message || 'Error al cargar los clientes');
                setClientes([]);
            }
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            message.error('Error al cargar los clientes');
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchText.trim() && !filters.region && !filters.ciudad) {
            fetchClientes(1, pagination.pageSize);
            return;
        }

        try {
            setSearching(true);
            setLoading(true);

            const searchParams = {
                searchText: searchText
            };

            // Añadir filtros
            if (filters.region) searchParams.region = filters.region;
            if (filters.ciudad) searchParams.ciudad = filters.ciudad;

            const response = await clienteService.searchClientes(searchParams);

            if (response?.data?.success) {
                let filteredResults = response.data.clientes || [];

                // Aplicar filtros adicionales en el cliente si es necesario
                if (filters.region && filteredResults.length > 0) {
                    filteredResults = filteredResults.filter(c => c.region === filters.region);
                }

                if (filters.ciudad && filteredResults.length > 0) {
                    filteredResults = filteredResults.filter(c => c.ciudad && c.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase()));
                }

                setClientes(filteredResults);

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
            region: undefined,
            ciudad: undefined
        });
        setSearching(false);
        fetchClientes(1, pagination.pageSize);
    };

    const handleDelete = async (codaux) => {
        try {
            setLoading(true);
            const response = await clienteService.deleteCliente(codaux);

            if (response?.data?.success) {
                message.success('Cliente eliminado correctamente');
                fetchClientes(pagination.current, pagination.pageSize);
            } else {
                message.error(response?.data?.message || 'Error al eliminar el cliente');
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            message.error('No se pudo eliminar el cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        if (searching) return;
        fetchClientes(newPagination.current, newPagination.pageSize);
    };

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            width: 250,
            sorter: (a, b) => {
                try {
                    return (a.nombre || '').localeCompare(b.nombre || '');
                } catch (error) {
                    return 0;
                }
            },
            render: (text, record) => (
                <div>
                    <div>{text || 'N/A'}</div>
                    <small style={{ color: '#888' }}>
                        RUT: {formatRut(record.codaux)}
                    </small>
                </div>
            )
        },
        {
            title: 'Dirección',
            key: 'direccion',
            width: 250,
            render: (record) => {
                const direccion = record.direccion ? `${record.direccion} ${record.numero || ''}` : 'N/A';
                return direccion;
            }
        },
        {
            title: 'Teléfono',
            dataIndex: 'fono',
            key: 'fono',
            width: 120,
        },
        {
            title: 'Ubicación',
            key: 'ubicacion',
            width: 200,
            render: (record) => {
                const regionNombre = record.region ? REGIONES[record.region] || `Región ${record.region}` : 'N/A';
                const ciudadNombre = record.ciudad || 'N/A';
                const comunaNombre = record.comuna || 'N/A';

                return (
                    <div>
                        <div>{ciudadNombre}</div>
                        {ciudadNombre !== comunaNombre && ciudadNombre !== 'N/A' && comunaNombre !== 'N/A' && (
                            <div><small>Comuna: {comunaNombre}</small></div>
                        )}
                        <Tooltip title={regionNombre}>
                            <small style={{ color: '#888' }}>{regionNombre}</small>
                        </Tooltip>
                    </div>
                );
            },
        },
        {
            title: 'Acciones',
            key: 'action',
            fixed: 'right',
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/clientes/${record.codaux}`)}
                        title="Ver detalle"
                        type="primary"
                        size="small"
                    >
                        Ver
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/clientes/edit/${record.codaux}`)}
                        title="Editar"
                        size="small"
                    >
                        Editar
                    </Button>
                    <Popconfirm
                        title="¿Estás seguro de eliminar este cliente?"
                        onConfirm={() => handleDelete(record.codaux)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            title="Eliminar"
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Listado de Clientes</Title>
                <Space>
                    <Link to="/clientes/create">
                        <Button type="primary" icon={<PlusOutlined />}>
                            Nuevo Cliente
                        </Button>
                    </Link>
                </Space>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: '100%', marginBottom: 16 }}>
                    <Input
                        placeholder="Buscar cliente por nombre, RUT, dirección..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 400 }}
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
                                    placeholder="Filtrar por región"
                                    style={{ width: '100%' }}
                                    value={filters.region}
                                    onChange={(value) => setFilters({ ...filters, region: value })}
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {Object.entries(REGIONES).map(([key, value]) => (
                                        <Option key={key} value={key}>
                                            {value}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={8}>
                                <Input
                                    placeholder="Filtrar por ciudad"
                                    value={filters.ciudad}
                                    onChange={(e) => setFilters({ ...filters, ciudad: e.target.value })}
                                    allowClear
                                />
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>

            <Table
                columns={columns}
                dataSource={clientes}
                rowKey="codaux"
                loading={loading}
                pagination={searching ? false : pagination}
                onChange={handleTableChange}
                scroll={{ x: 900 }}
                locale={{
                    emptyText: <Empty description="No hay clientes disponibles" />
                }}
            />
        </div>
    );
};

export default ClienteList;