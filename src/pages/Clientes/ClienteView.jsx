import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography, Tag, Row, Col, Divider, Space } from 'antd';
import { EditOutlined, ArrowLeftOutlined, PrinterOutlined, UserOutlined, EnvironmentOutlined, InfoCircleOutlined, IdcardOutlined, PhoneOutlined } from '@ant-design/icons';
import clienteService from '../../services/clienteService';

const { Title } = Typography;

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

const ClienteView = () => {
    const { codaux } = useParams();
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClienteData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await clienteService.getClienteById(codaux);

                if (response?.success && response.cliente) {
                    setCliente(response.cliente);
                } else {
                    throw new Error(response?.message || "No se encontraron datos.");
                }
            } catch (error) {
                console.error("Error al obtener datos:", error);
                setError(error.message || "Error al cargar los datos del cliente");
                message.error(error.message || "Error al cargar los datos del cliente");
            } finally {
                setLoading(false);
            }
        };

        fetchClienteData();
    }, [codaux]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (error || !cliente) {
        return (
            <div>
                <Title level={3}>Cliente no encontrado</Title>
                <p style={{ color: 'red' }}>{error || "No se encontró información del cliente en el servidor."}</p>
                <Link to="/clientes">
                    <Button type="primary">Volver a clientes</Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Header con acciones */}
            <Row gutter={16} className="no-print" style={{ marginBottom: 16 }}>
                <Col span={16}>
                    <Space align="center">
                        <Title level={2} style={{ margin: 0 }}>
                            Cliente: {cliente.nombre}
                        </Title>
                        <Tag color="blue">Código: {cliente.codaux}</Tag>
                    </Space>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                    <Space>
                        <Link to="/clientes">
                            <Button icon={<ArrowLeftOutlined />}>
                                Volver
                            </Button>
                        </Link>
                        <Link to={`/clientes/edit/${codaux}`}>
                            <Button icon={<EditOutlined />}>
                                Editar
                            </Button>
                        </Link>
                        <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                            Imprimir
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Contenido principal */}
            <div className="main-content">
                <Row gutter={16}>
                    {/* Primera columna - Información básica */}
                    <Col xs={24} lg={12}>
                        {/* Información básica */}
                        <Card
                            title={<Space><InfoCircleOutlined /> Información General</Space>}
                            className="info-card"
                            style={{ marginBottom: 16 }}
                        >
                            <Descriptions column={1} size="middle" bordered>
                                <Descriptions.Item
                                    label={<Space><IdcardOutlined /> Código Auxiliar</Space>}
                                >
                                    {cliente.codaux || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<Space><UserOutlined /> Nombre</Space>}
                                >
                                    {cliente.nombre || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<Space><IdcardOutlined /> RUT</Space>}
                                >
                                    {cliente.rut ? formatRut(cliente.rut) : 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<Space><PhoneOutlined /> Teléfono</Space>}
                                >
                                    {cliente.fono || 'N/A'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Segunda columna - Información de dirección */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={<Space><EnvironmentOutlined /> Información de Ubicación</Space>}
                            className="info-card"
                            style={{ marginBottom: 16 }}
                        >
                            <Descriptions column={1} size="middle" bordered>
                                <Descriptions.Item
                                    label={<Space><EnvironmentOutlined /> Dirección</Space>}
                                >
                                    {cliente.direccion ? `${cliente.direccion} ${cliente.numero || ''}` : 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<Space><EnvironmentOutlined /> Comuna</Space>}
                                >
                                    {cliente.comuna || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<Space><EnvironmentOutlined /> Ciudad</Space>}
                                >
                                    {cliente.ciudad || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<Space><EnvironmentOutlined /> Región</Space>}
                                >
                                    {cliente.region ? REGIONES[cliente.region] || `Región ${cliente.region}` : 'N/A'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Historial de Solicitudes">
                            <p>Esta sección podría mostrar un listado de solicitudes relacionadas con este cliente.</p>
                            <Link to={`/solicitudes/search?codaux=${cliente.codaux}`}>
                                <Button type="primary">
                                    Ver Solicitudes Relacionadas
                                </Button>
                            </Link>
                        </Card>
                    </Col>
                </Row>
            </div>

            <style jsx="true">{`
                .main-content {
                    margin-bottom: 20px;
                }
                
                .info-card {
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }

                @media print {
                    .no-print {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default ClienteView;