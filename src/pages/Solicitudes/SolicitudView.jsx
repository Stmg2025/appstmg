import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography, Tag, Row, Col, Divider, Space, Tabs, Badge } from 'antd';
import { EditOutlined, ArrowLeftOutlined, PrinterOutlined, UserOutlined, ToolOutlined, ScheduleOutlined, CheckOutlined, FileTextOutlined, FilePdfOutlined, CalendarOutlined, EnvironmentOutlined, InfoCircleOutlined, IdcardOutlined, TeamOutlined } from '@ant-design/icons';
import moment from 'moment';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';
import SolicitudViewPdf from './SolicitudViewPdf';

const { Title } = Typography;
const { TabPane } = Tabs;

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

// Mapeo de tipos de solicitud
const getTipoLabel = (tipo) => {
    const tiposMap = {
        'Garantia': 'Garantía',
        'Servicio': 'Servicio',
        'Mantenimiento': 'Mantenimiento',
        'Cortesia': 'Cortesía',
        'Instalacion': 'Instalación',
        'Reparacion': 'Reparación',
        'Conversion': 'Conversión',
        'Logistica': 'Logística'
    };

    return tiposMap[tipo] || tipo || 'N/A';
};

const SolicitudView = () => {
    const { id } = useParams();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tecnicoAsignado, setTecnicoAsignado] = useState(null);
    const [estadoAsignado, setEstadoAsignado] = useState(null);
    const [showPdf, setShowPdf] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        const fetchSolicitudData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await solicitudService.getSolicitudById(id);

                if (response?.data?.success && response.data.solicitud) {
                    setSolicitud(response.data.solicitud);

                    // Cargar técnico asignado
                    if (response.data.solicitud.tecnico_asignado) {
                        try {
                            const tecnicoResponse = await tecnicoService.getTecnicoById(response.data.solicitud.tecnico_asignado);
                            if (tecnicoResponse?.data?.success) {
                                setTecnicoAsignado(tecnicoResponse.data.tecnico);
                            }
                        } catch (error) {
                            console.error("Error al obtener datos del técnico:", error);
                        }
                    }

                    // Cargar estado asignado
                    if (response.data.solicitud.estado_id) {
                        try {
                            const estadoResponse = await estadoSolicitudService.getEstadoById(response.data.solicitud.estado_id);
                            if (estadoResponse?.data?.success) {
                                setEstadoAsignado(estadoResponse.data.estado);
                            }
                        } catch (error) {
                            console.error("Error al obtener datos del estado:", error);
                        }
                    }
                } else {
                    throw new Error(response?.data?.message || "No se encontraron datos.");
                }
            } catch (error) {
                console.error("Error al obtener datos:", error);
                setError(error.message || "Error al cargar los datos de la solicitud");
                message.error(error.message || "Error al cargar los datos de la solicitud");
            } finally {
                setLoading(false);
            }
        };

        fetchSolicitudData();
    }, [id]);

    const handlePrint = () => {
        setShowPdf(true);
        setTimeout(() => {
            window.print();
            setShowPdf(false);
        }, 100);
    };

    const handleExportPDF = () => {
        if (!solicitud) return;
        setShowPdf(true);
        // SolicitudViewPdf manejará la exportación
    };

    const getEstadoTag = (estado) => {
        try {
            const estadoMap = {
                'AP': { text: 'Aprobada', color: 'green' },
                'PE': { text: 'Pendiente', color: 'orange' },
                'CA': { text: 'Cancelada', color: 'red' },
                'FI': { text: 'Finalizada', color: 'blue' }
            };

            const estadoInfo = estadoMap[estado] || { text: estado || 'Desconocido', color: 'default' };
            return <Tag color={estadoInfo.color}>{estadoInfo.text}</Tag>;
        } catch (error) {
            return <Tag color="default">Error</Tag>;
        }
    };

    const getEstadoAsignadoTag = (estado) => {
        try {
            if (!estado || !estado.nombre) return <Tag color="default">No definido</Tag>;

            // Color según el nombre del estado
            const getColorByNombre = (nombre) => {
                const nombreLower = (nombre || '').toLowerCase();
                if (nombreLower.includes('pendiente')) return 'orange';
                if (nombreLower.includes('proceso') || nombreLower.includes('progreso')) return 'blue';
                if (nombreLower.includes('completa') || nombreLower.includes('finaliza')) return 'green';
                if (nombreLower.includes('cancela') || nombreLower.includes('rechaza')) return 'red';
                return 'default';
            };

            return <Tag color={getColorByNombre(estado.nombre)}>{estado.nombre}</Tag>;
        } catch (error) {
            return <Tag color="default">Error</Tag>;
        }
    };

    const getAreaTrabajoLabel = (area) => {
        if (!area) return 'N/A';
        if (area === 'PLANTA') return 'Taller';
        return area;
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'No disponible';
            return new Date(dateString).toLocaleString('es-CL');
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    const verificarGarantia = (fechaFactura) => {
        if (!fechaFactura) return false;
        const fechaLimite = moment(fechaFactura).add(1, 'year');
        return moment().isBefore(fechaLimite);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (error || !solicitud) {
        return (
            <div>
                <Title level={3}>Solicitud no encontrada</Title>
                <p style={{ color: 'red' }}>{error || "No se encontró información de la solicitud en el servidor."}</p>
                <Link to="/solicitudes">
                    <Button type="primary">Volver a solicitudes</Button>
                </Link>
            </div>
        );
    }

    // Verificar si la garantía está activa
    const garantiaActiva = solicitud.fecha_fact ? verificarGarantia(solicitud.fecha_fact) : false;

    return (
        <div>
            {showPdf ? (
                <SolicitudViewPdf
                    solicitud={solicitud}
                    tecnicoAsignado={tecnicoAsignado}
                    estadoAsignado={estadoAsignado}
                    garantiaActiva={garantiaActiva}
                    onFinish={() => setShowPdf(false)}
                />
            ) : (
                <>
                    {/* Header con acciones */}
                    <Row gutter={16} className="no-print" style={{ marginBottom: 16 }}>
                        <Col span={16}>
                            <Space align="center">
                                <Title level={2} style={{ margin: 0 }}>
                                    Solicitud #{solicitud.id}
                                </Title>
                                {estadoAsignado ? getEstadoAsignadoTag(estadoAsignado) : getEstadoTag(solicitud.estado)}
                            </Space>
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            <Space>
                                <Link to="/solicitudes">
                                    <Button icon={<ArrowLeftOutlined />}>
                                        Volver
                                    </Button>
                                </Link>
                                <Link to={`/solicitudes/edit/${id}`}>
                                    <Button icon={<EditOutlined />}>
                                        Editar
                                    </Button>
                                </Link>
                                <Button type="primary" icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                                    Exportar PDF
                                </Button>
                                <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                                    Imprimir
                                </Button>
                            </Space>
                        </Col>
                    </Row>

                    {/* Contenido principal */}
                    <div className="main-content" ref={contentRef}>
                        <Row gutter={16}>
                            {/* Primera columna - Información básica */}
                            <Col xs={24} lg={8}>
                                {/* Información básica */}
                                <Card
                                    title={<Space><InfoCircleOutlined /> Información General</Space>}
                                    className="info-card"
                                    style={{ marginBottom: 16 }}
                                >
                                    <Descriptions column={1} size="small" bordered>
                                        <Descriptions.Item
                                            label={<Space><CalendarOutlined /> Fecha</Space>}
                                        >
                                            {formatDate(solicitud.fecha)}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<Space><ScheduleOutlined /> Tipo de Solicitud</Space>}
                                        >
                                            {getTipoLabel(solicitud.tipo)}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<Space><UserOutlined /> Creada Por</Space>}
                                        >
                                            {solicitud.creada_por || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<Space><EnvironmentOutlined /> Área de Trabajo</Space>}
                                        >
                                            <Tag color="blue">{getAreaTrabajoLabel(solicitud.area_trab)}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<Space><EnvironmentOutlined /> Región</Space>}
                                        >
                                            {REGIONES[solicitud.region] || `Región ${solicitud.region}`}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                {/* Datos del cliente */}
                                <Card
                                    title={<Space><UserOutlined /> Información del Cliente</Space>}
                                    className="info-card"
                                    style={{ marginBottom: 16 }}
                                >
                                    <Descriptions column={1} size="small" bordered>
                                        <Descriptions.Item
                                            label={<Space><IdcardOutlined /> RUT</Space>}
                                        >
                                            {solicitud.codaux ? formatRut(solicitud.codaux) : 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<Space><UserOutlined /> Nombre</Space>}
                                        >
                                            {solicitud.nomaux || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<Space><EnvironmentOutlined /> Dirección</Space>}
                                        >
                                            {solicitud.dir_visita || 'N/A'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                {/* Datos de facturación */}
                                <Card
                                    title={<Space><FileTextOutlined /> Facturación</Space>}
                                    className="info-card"
                                    style={{ marginBottom: 16 }}
                                >
                                    <Descriptions column={1} size="small" bordered>
                                        <Descriptions.Item
                                            label={<Space><FileTextOutlined /> N° Factura</Space>}
                                        >
                                            {solicitud.factura || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<Space><CalendarOutlined /> Fecha Factura</Space>}
                                        >
                                            {solicitud.fecha_fact ? formatDate(solicitud.fecha_fact) : 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label="Estado Garantía"
                                        >
                                            {solicitud.fecha_fact ? (
                                                <Badge
                                                    status={garantiaActiva ? "success" : "error"}
                                                    text={garantiaActiva ? "Garantía activa" : "Garantía vencida"}
                                                />
                                            ) : 'N/A'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            {/* Segunda columna - Detalles técnicos */}
                            <Col xs={24} lg={16}>
                                <Tabs defaultActiveKey="1" type="card">
                                    <TabPane tab={<span><ToolOutlined /> Detalles Técnicos</span>} key="1">
                                        <Card className="info-card">
                                            <Descriptions title="Problema Reportado" column={1} size="small" bordered>
                                                <Descriptions.Item label="Descripción del Problema">
                                                    {solicitud.desc_motivo || 'N/A'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Número de Serie">
                                                    {solicitud.nro_serie || 'N/A'}
                                                </Descriptions.Item>
                                            </Descriptions>

                                            <Divider />

                                            <Descriptions title="Técnico Asignado" column={1} size="small" bordered>
                                                {tecnicoAsignado ? (
                                                    <>
                                                        <Descriptions.Item label={<Space><TeamOutlined /> Nombre</Space>}>
                                                            {tecnicoAsignado.nombre_completo || 'Sin nombre'}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label={<Space><ToolOutlined /> Especialidad</Space>}>
                                                            {tecnicoAsignado.especialidad || 'No especificada'}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label={<Space><IdcardOutlined /> Tipo</Space>}>
                                                            <Tag color={tecnicoAsignado.tipo_tecnico === 'Interno' ? 'green' : 'orange'}>
                                                                {tecnicoAsignado.tipo_tecnico || 'No especificado'}
                                                            </Tag>
                                                        </Descriptions.Item>
                                                    </>
                                                ) : (
                                                    <Descriptions.Item label="Técnico">
                                                        No asignado
                                                    </Descriptions.Item>
                                                )}
                                            </Descriptions>
                                        </Card>
                                    </TabPane>

                                    <TabPane tab={<span><CheckOutlined /> Estado</span>} key="2">
                                        <Card className="info-card">
                                            <Descriptions column={1} size="small" bordered>
                                                <Descriptions.Item label="Estado Actual">
                                                    {estadoAsignado ? getEstadoAsignadoTag(estadoAsignado) : getEstadoTag(solicitud.estado)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Fecha de Estado">
                                                    {solicitud.fecha_estado ? formatDate(solicitud.fecha_estado) : 'N/A'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Fecha de Cierre">
                                                    {solicitud.fec_cierre ? formatDate(solicitud.fec_cierre) : 'Pendiente de cierre'}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </TabPane>
                                </Tabs>
                            </Col>
                        </Row>
                    </div>
                </>
            )}

            <style jsx="true">{`
                .main-content {
                    margin-bottom: 20px;
                }
                
                .info-card {
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
};

export default SolicitudView;