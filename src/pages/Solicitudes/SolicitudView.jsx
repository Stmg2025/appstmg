import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography, Tag, Row, Col, Divider, Space } from 'antd';
import { EditOutlined, ArrowLeftOutlined, PrinterOutlined, UserOutlined, ToolOutlined, ScheduleOutlined, CheckOutlined, FileTextOutlined, FilePdfOutlined } from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';
import logo from '../../assets/logo.png';

const { Title, Text } = Typography;

const SolicitudView = () => {
    const { id } = useParams();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tecnicoAsignado, setTecnicoAsignado] = useState(null);
    const [estadoAsignado, setEstadoAsignado] = useState(null);
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
        window.print();
    };

    const handleExportPDF = async () => {
        try {
            message.loading({ content: 'Generando PDF...', key: 'pdfLoading' });
            const element = contentRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                windowWidth: 1920
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter' // Formato carta (216 x 279 mm)
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`hoja_servicio_${id}.pdf`);

            message.success({ content: 'PDF generado correctamente', key: 'pdfLoading' });
        } catch (error) {
            console.error('Error al generar PDF:', error);
            message.error({ content: 'Error al generar el PDF', key: 'pdfLoading' });
        }
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

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'No disponible';
            return new Date(dateString).toLocaleString('es-CL');
        } catch (error) {
            return 'Fecha inválida';
        }
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

    return (
        <div className="print-container">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }} className="no-print">
                <Title level={2}>Hoja de Servicio #{solicitud.id}</Title>
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
            </div>

            <div ref={contentRef} className="documento-carta">
                {/* Encabezado con logo */}
                <div className="header">
                    <div className="logo-container">
                        <img src={logo} alt="Logo STMG" className="logo" />
                    </div>
                    <div className="company-info">
                        <h1>Hoja de Servicio Técnico</h1>
                        <p>Servicio Técnico MAIGAS</p>
                        <p>Santiago, Chile</p>
                    </div>
                    <div className="doc-number">
                        <div className="folio">Folio N° {solicitud.id}</div>
                        <div className="doc-date">Fecha: {formatDate(solicitud.fecha).split(',')[0]}</div>
                    </div>
                </div>

                <Divider style={{ margin: '16px 0', borderColor: '#1890ff' }} />

                {/* Información del Cliente */}
                <Card
                    title={<><UserOutlined /> Información del Cliente</>}
                    style={{ marginBottom: 16 }}
                    className="card-section"
                    headStyle={{ backgroundColor: '#f0f5ff', color: '#096dd9' }}
                >
                    <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 'bold' }}>
                        <Descriptions.Item label="Código Cliente">{solicitud.codaux || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Nombre Cliente">{solicitud.nomaux || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Dirección">{solicitud.dir_visita || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Región/Comuna">{solicitud.region || 'N/A'} / {solicitud.comuna || 'N/A'}</Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Problema y Equipo */}
                <Card
                    title={<><ToolOutlined /> Detalle del Problema y Equipo</>}
                    style={{ marginBottom: 16 }}
                    className="card-section"
                    headStyle={{ backgroundColor: '#f6ffed', color: '#52c41a' }}
                >
                    <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 'bold' }}>
                        <Descriptions.Item label="Tipo de Motivo">{solicitud.tipo_motivo || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Descripción del Problema">{solicitud.desc_motivo || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Código de Falla">{solicitud.codigo_falla || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Número de Serie">{solicitud.nro_serie || 'N/A'}</Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Información del Técnico y Agendamiento */}
                <Card
                    title={<><ScheduleOutlined /> Información de Agendamiento</>}
                    style={{ marginBottom: 16 }}
                    className="card-section"
                    headStyle={{ backgroundColor: '#e6f7ff', color: '#1890ff' }}
                >
                    <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 'bold' }}>
                        <Descriptions.Item label="Técnico Asignado">
                            {tecnicoAsignado ? (
                                <div>
                                    <div>{tecnicoAsignado.nombre_completo || 'Sin nombre'}</div>
                                    <div><small>Especialidad: {tecnicoAsignado.especialidad || 'No especificada'}</small></div>
                                    <div><small>Tipo: {tecnicoAsignado.tipo_tecnico || 'No especificado'}</small></div>
                                </div>
                            ) : solicitud.tecnico_asignado ? (
                                `ID: ${solicitud.tecnico_asignado} (No se pudieron cargar detalles)`
                            ) : (
                                'No asignado'
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Área de Trabajo">{solicitud.area_trab || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Fecha de Estado">{solicitud.fecha_estado ? formatDate(solicitud.fecha_estado) : 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Estado Actual">
                            {estadoAsignado ? getEstadoAsignadoTag(estadoAsignado) : getEstadoTag(solicitud.estado)}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Resolución */}
                <Card
                    title={<><CheckOutlined /> Resolución</>}
                    style={{ marginBottom: 16 }}
                    className="card-section"
                    headStyle={{ backgroundColor: '#f9f0ff', color: '#722ed1' }}
                >
                    <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 'bold' }}>
                        <Descriptions.Item label="Fecha de Cierre">{solicitud.fec_cierre ? formatDate(solicitud.fec_cierre) : 'No cerrada'}</Descriptions.Item>
                        <Descriptions.Item label="Fecha Real de Cierre">{solicitud.fec_real_cierre ? formatDate(solicitud.fec_real_cierre) : 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Técnico de Cierre">{solicitud.tecnico_cierre || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Motivo de Estado">{solicitud.motivo_estado || 'N/A'}</Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Información Administrativa */}
                <Card
                    title={<><FileTextOutlined /> Información Administrativa</>}
                    style={{ marginBottom: 16 }}
                    className="card-section"
                    headStyle={{ backgroundColor: '#fff7e6', color: '#fa8c16' }}
                >
                    <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 'bold' }}>
                        <Descriptions.Item label="Tipo">{solicitud.tipo === 'F' ? 'Facturado' : 'No Facturado'}</Descriptions.Item>
                        <Descriptions.Item label="Número Factura">{solicitud.factura || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Fecha Factura">{solicitud.fecha_fact || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Creada Por">{solicitud.creada_por || 'N/A'}</Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Firma del cliente */}
                <div className="firma-section">
                    <div className="firma-box">
                        <Divider style={{ margin: '60px 30px 5px 30px' }} />
                        <p style={{ textAlign: 'center' }}>Firma del Cliente</p>
                    </div>
                    <div className="firma-box">
                        <Divider style={{ margin: '60px 30px 5px 30px' }} />
                        <p style={{ textAlign: 'center' }}>Firma del Técnico</p>
                    </div>
                </div>

                {/* Pie de página */}
                <div className="footer">
                    <p>STMG - Servicio Técnico MAIGAS</p>
                    <p>Teléfono: +56 2 2222 3333 • Email: contacto@stmg.cl • www.stmg.cl</p>
                    <p className="page-number">Página 1 de 1</p>
                </div>
            </div>

            <style jsx="true">{`
                .documento-carta {
                    width: 400.9mm;
                    min-height: 279.4mm;
                    margin: 0 auto;
                    padding: 15mm;
                    background: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    font-family: Arial, sans-serif;
                    position: relative;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .logo-container {
                    width: 20%;
                }

                .logo {
                    max-width: 100%;
                    max-height: 60px;
                }

                .company-info {
                    width: 50%;
                    text-align: center;
                }

                .company-info h1 {
                    margin: 0;
                    font-size: 22px;
                    color: #1890ff;
                }

                .company-info p {
                    margin: 3px 0;
                    color: #666;
                    font-size: 14px;
                }

                .doc-number {
                    width: 30%;
                    text-align: right;
                }

                .folio {
                    font-size: 16px;
                    font-weight: bold;
                    color: #1890ff;
                    margin-bottom: 5px;
                }

                .doc-date {
                    font-size: 14px;
                    color: #666;
                }

                .card-section {
                    border-radius: 6px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                    overflow: hidden;
                }

                .firma-section {
                    display: flex;
                    justify-content: space-around;
                    margin: 40px 0;
                }

                .firma-box {
                    width: 40%;
                }

                .footer {
                    position: absolute;
                    left: 15mm;
                    right: 15mm;
                    bottom: 15mm;
                    border-top: 1px solid #e8e8e8;
                    padding-top: 10px;
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                }

                .footer p {
                    margin: 2px 0;
                }

                .page-number {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                }

                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .documento-carta {
                        box-shadow: none;
                        padding: 5mm;
                        width: 100%;
                        min-height: auto;
                    }
                    .ant-card {
                        break-inside: avoid;
                        margin-bottom: 10mm;
                        border: 1px solid #ddd !important;
                        box-shadow: none !important;
                    }
                    .ant-card-head {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        padding: 0;
                        margin: 0;
                    }
                    @page {
                        size: letter;
                        margin: 10mm;
                    }
                }
                @media screen {
                    .print-only {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default SolicitudView;