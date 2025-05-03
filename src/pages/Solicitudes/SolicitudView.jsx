import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography, Tag, Row, Col, Divider, Space, Tabs, Badge } from 'antd';
import {
    EditOutlined, ArrowLeftOutlined, PrinterOutlined, UserOutlined, ToolOutlined, ScheduleOutlined, CheckOutlined,
    FileTextOutlined, FilePdfOutlined, CalendarOutlined, EnvironmentOutlined, InfoCircleOutlined, IdcardOutlined,
    TeamOutlined, FieldTimeOutlined, StarOutlined, MailOutlined, PhoneOutlined, SyncOutlined
} from '@ant-design/icons';
import moment from 'moment';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';
import SolicitudViewPdf from './SolicitudViewPdf';
import { REGIONES, formatRut, getPrioridadColor, getAreaTrabajoLabel, getTipoLabel, formatDate, garantiaActiva, getColorByEstadoNombre } from './constants';

const { Title } = Typography;
const { TabPane } = Tabs;

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
                        const tecnicoResponse = await tecnicoService.getTecnicoById(response.data.solicitud.tecnico_asignado);
                        if (tecnicoResponse?.data?.success) {
                            setTecnicoAsignado(tecnicoResponse.data.tecnico);
                        }
                    }

                    // Cargar estado asignado
                    if (response.data.solicitud.estado_id) {
                        const estadoResponse = await estadoSolicitudService.getEstadoById(response.data.solicitud.estado_id);
                        if (estadoResponse?.data?.success) {
                            setEstadoAsignado(estadoResponse.data.estado);
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
    };

    const getEstadoTag = (estado) => {
        const estadoMap = {
            'AP': { text: 'Aprobada', color: 'green' },
            'PE': { text: 'Pendiente', color: 'orange' },
            'CA': { text: 'Cancelada', color: 'red' },
            'FI': { text: 'Finalizada', color: 'blue' }
        };
        const estadoInfo = estadoMap[estado] || { text: estado || 'Desconocido', color: 'default' };
        return <Tag color={estadoInfo.color}>{estadoInfo.text}</Tag>;
    };

    const getEstadoAsignadoTag = (estado) => {
        if (!estado || !estado.nombre) return <Tag color="default">No definido</Tag>;
        return <Tag color={getColorByEstadoNombre(estado.nombre)}>{estado.nombre}</Tag>;
    };

    const getSeguimientoTag = (valor) => {
        if (valor === 'S') return <Badge status="success" text="Sí" />;
        if (valor === 'N') return <Badge status="error" text="No" />;
        return <Badge status="default" text="No definido" />;
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

    const garantiaEstaActiva = solicitud.fecha_fact ? garantiaActiva(solicitud.fecha_fact) : false;

    return (
        <div>
            {showPdf ? (
                <SolicitudViewPdf
                    solicitud={solicitud}
                    tecnicoAsignado={tecnicoAsignado}
                    estadoAsignado={estadoAsignado}
                    garantiaActiva={garantiaEstaActiva}
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
                                {solicitud.prioridad && (
                                    <Tag color={getPrioridadColor(solicitud.prioridad)}>
                                        Prioridad: {solicitud.prioridad}
                                    </Tag>
                                )}
                            </Space>
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            <Space>
                                <Link to="/solicitudes">
                                    <Button icon={<ArrowLeftOutlined />}>Volver</Button>
                                </Link>
                                <Link to={`/solicitudes/edit/${id}`}>
                                    <Button icon={<EditOutlined />}>Editar</Button>
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
                                        <Descriptions.Item label={<Space><CalendarOutlined /> Fecha</Space>}>
                                            {formatDate(solicitud.fecha)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><ScheduleOutlined /> Tipo Solicitud</Space>}>
                                            {getTipoLabel(solicitud.tipo)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><UserOutlined /> Creada Por</Space>}>
                                            {solicitud.creada_por || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><FieldTimeOutlined /> Ejecución</Space>}>
                                            {solicitud.ejecucion || 'No definido'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><StarOutlined /> Prioridad</Space>}>
                                            {solicitud.prioridad ? (
                                                <Tag color={getPrioridadColor(solicitud.prioridad)}>{solicitud.prioridad}</Tag>
                                            ) : 'No definida'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><EnvironmentOutlined /> Área</Space>}>
                                            <Tag color="blue">{getAreaTrabajoLabel(solicitud.area_trab)}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><EnvironmentOutlined /> Región</Space>}>
                                            {REGIONES[solicitud.region] || `Región ${solicitud.region}`}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><EnvironmentOutlined /> Comuna</Space>}>
                                            {solicitud.comuna || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><CalendarOutlined /> Modificación</Space>}>
                                            {formatDate(solicitud.fecha_modificacion)}
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
                                        <Descriptions.Item label={<Space><IdcardOutlined /> RUT</Space>}>
                                            {solicitud.codaux ? formatRut(solicitud.codaux) : 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><UserOutlined /> Nombre</Space>}>
                                            {solicitud.nomaux || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><UserOutlined /> Tipo Cliente</Space>}>
                                            {solicitud.tipo_cliente || 'No especificado'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><EnvironmentOutlined /> Dirección</Space>}>
                                            {solicitud.dir_visita || 'N/A'}
                                        </Descriptions.Item>
                                        {/* Datos de contacto */}
                                        <Descriptions.Item label={<Space><UserOutlined /> Contacto</Space>}>
                                            {solicitud.nombre || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><PhoneOutlined /> Teléfono</Space>}>
                                            {solicitud.telefono || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                                            {solicitud.mail || 'N/A'}
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
                                        <Descriptions.Item label={<Space><FileTextOutlined /> N° Factura</Space>}>
                                            {solicitud.factura || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><FileTextOutlined /> Factura Distribuidor</Space>}>
                                            {solicitud.factura_dist || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<Space><CalendarOutlined /> Fecha Factura</Space>}>
                                            {solicitud.fecha_fact ? formatDate(solicitud.fecha_fact) : 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Facturable">
                                            {solicitud.facturable || 'No especificado'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Garantía">
                                            {solicitud.fecha_fact ? (
                                                <Badge
                                                    status={garantiaEstaActiva ? "success" : "error"}
                                                    text={garantiaEstaActiva ? "Activa" : "Vencida"}
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
                                                <Descriptions.Item label="Código Producto">
                                                    {solicitud.codprod || 'N/A'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Descripción Producto">
                                                    {solicitud.desprod || 'N/A'}
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

                                                <Descriptions.Item label={<Space><CalendarOutlined /> Fecha Agendamiento</Space>}>
                                                    {solicitud.fecha_agendamiento ? formatDate(solicitud.fecha_agendamiento) : 'No agendado'}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </TabPane>

                                    <TabPane tab={<span><CheckOutlined /> Estado</span>} key="2">
                                        <Card className="info-card">
                                            <Descriptions column={1} size="small" bordered>
                                                <Descriptions.Item label="Estado Actual">
                                                    {estadoAsignado ? getEstadoAsignadoTag(estadoAsignado) : getEstadoTag(solicitud.estado)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Motivo del Estado">
                                                    {solicitud.motivo_estado || 'No especificado'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Fecha de Estado">
                                                    {solicitud.fecha_estado ? formatDate(solicitud.fecha_estado) : 'N/A'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Técnico de Cierre">
                                                    {solicitud.tecnico_cierre || 'Pendiente'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Fecha de Cierre">
                                                    {solicitud.fec_cierre ? formatDate(solicitud.fec_cierre) : 'Pendiente de cierre'}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </TabPane>

                                    <TabPane tab={<span><SyncOutlined /> Seguimiento</span>} key="3">
                                        <Card className="info-card">
                                            <Descriptions column={1} size="small" bordered>
                                                <Descriptions.Item label="Cliente Contactado">
                                                    {getSeguimientoTag(solicitud.cliente_contactado)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Distribuidor Contactado">
                                                    {getSeguimientoTag(solicitud.distribuidor_contactado)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Técnico Confirmado">
                                                    {getSeguimientoTag(solicitud.tecnico_confirmado)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Reporte Enviado">
                                                    {getSeguimientoTag(solicitud.reporte_enviado)}
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
                .main-content { margin-bottom: 20px; }
                .info-card { box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
            `}</style>
        </div>
    );
};

export default SolicitudView;