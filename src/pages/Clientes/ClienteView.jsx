import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography, Tag, Row, Col, Divider, Space } from 'antd';
import {
    EditOutlined, ArrowLeftOutlined, PrinterOutlined, UserOutlined,
    EnvironmentOutlined, InfoCircleOutlined, IdcardOutlined, PhoneOutlined,
    MailOutlined, TagOutlined
} from '@ant-design/icons';
import clienteService from '../../services/clienteService';
import { REGIONES } from "../../utils/ubicacion";
import { formatRut } from "../../utils/formatters";

const { Title } = Typography;

// Función para determinar el color del tag del tipo de cliente
const getTipoColor = (tipo) => {
    if (!tipo) return 'default';

    const tiposColors = {
        'Personal': 'blue',
        'Empresa': 'green',
        'Distribuidor': 'purple',
        'Otro': 'orange'
    };

    return tiposColors[tipo] || 'default';
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
                        {cliente.tipo && (
                            <Tag color={getTipoColor(cliente.tipo)}>
                                {cliente.tipo}
                            </Tag>
                        )}
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
                                <Descriptions.Item
                                    label={<Space><MailOutlined /> Correo Electrónico</Space>}
                                >
                                    {cliente.correoelectronico || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<Space><TagOutlined /> Tipo de Cliente</Space>}
                                >
                                    {cliente.tipo ? (
                                        <Tag color={getTipoColor(cliente.tipo)}>{cliente.tipo}</Tag>
                                    ) : 'N/A'}
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