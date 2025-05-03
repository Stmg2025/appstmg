import React, { useState } from 'react';
import {
    Card, Table, Input, Button, DatePicker,
    Typography, Row, Col, Form, Space,
    message, Modal, Divider, Descriptions,
    Alert, Empty
} from 'antd';
import {
    SearchOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    ReloadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/es';
import facturaService from '../../services/facturaService';

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Función para formatear RUT chileno
const formatRut = (rut) => {
    if (!rut) return 'N/A';
    // Limpiar RUT
    const rutLimpio = rut.replace(/[^0-9Kk]+/g, '');
    let rutFormateado = '';
    let tempRut = rutLimpio.slice(0, -1);
    let dv = rutLimpio.slice(-1).toUpperCase();

    // Formatear con puntos y guión
    while (tempRut.length > 0) {
        rutFormateado = tempRut.slice(-3) + rutFormateado;
        tempRut = tempRut.slice(0, -3);
        if (tempRut.length > 0) {
            rutFormateado = '.' + rutFormateado;
        }
    }
    return rutFormateado ? rutFormateado + '-' + dv : 'N/A';
};

// Función para convertir formato de fecha entre frontend y backend
const adaptarFecha = (fecha, destino = 'frontend') => {
    if (!fecha) return '';

    // Si ya está en formato esperado, no hacer nada
    if (destino === 'frontend' && fecha.includes('/')) return fecha;
    if (destino === 'backend' && fecha.includes('-')) return fecha;

    try {
        if (destino === 'backend') {
            // DD/MM/YYYY a YYYY-MM-DD
            const partes = fecha.split('/');
            if (partes.length === 3) {
                return `${partes[2]}-${partes[1]}-${partes[0]}`;
            }
        } else {
            // YYYY-MM-DD a DD/MM/YYYY
            const partes = fecha.split('-');
            if (partes.length === 3) {
                return `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
        }
    } catch (error) {
        console.error('Error al adaptar fecha:', error);
    }

    return fecha; // Devolver original si hay error
};

const FacturaBusqueda = () => {
    const [form] = Form.useForm();
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [modalVisible, setModalVisible] = useState(false);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
    const [exportando, setExportando] = useState(false);

    // Función para buscar facturas
    const buscarFacturas = async (values) => {
        setLoading(true);
        setError(null);

        try {
            // Adaptar valores para la API
            const filters = { ...values };

            // Procesar rango de fechas
            if (filters.fechaRango && Array.isArray(filters.fechaRango) && filters.fechaRango.length === 2) {
                // Formatear fechas para backend (DD/MM/YYYY)
                filters.fechaDesde = filters.fechaRango[0].format('DD/MM/YYYY');
                filters.fechaHasta = filters.fechaRango[1].format('DD/MM/YYYY');
                delete filters.fechaRango;
            }

            // Eliminar propiedades undefined o vacías
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined || filters[key] === '') {
                    delete filters[key];
                }
            });

            // Log para depuración
            console.log('Enviando filtros:', filters);

            // Llamar al servicio
            const response = await facturaService.searchFacturas(filters);

            if (response?.data?.success) {
                // Extraer facturas de la respuesta (puede estar en diferentes propiedades)
                const facturasRecibidas = response.data.facturas ||
                    (response.data.data && response.data.data.facturas) ||
                    [];

                // Extraer metadatos
                const metadata = response.data.metadata ||
                    (response.data.data && response.data.data.metadata) ||
                    { totalCount: facturasRecibidas.length };

                // Adaptar fechas a formato frontend
                const facturasFormateadas = facturasRecibidas.map(factura => ({
                    ...factura,
                    Fecha: adaptarFecha(factura.Fecha, 'frontend')
                }));

                setFacturas(facturasFormateadas);
                setHasSearched(true);
                setPagination({
                    ...pagination,
                    total: metadata.totalCount || facturasFormateadas.length
                });

                // Mostrar mensaje de resultado
                const mensajeResultado = facturasFormateadas.length
                    ? `Se encontraron ${facturasFormateadas.length} facturas`
                    : 'No se encontraron facturas con los criterios seleccionados';
                message.info(mensajeResultado);
            } else {
                setError(response?.data?.message || 'Error al buscar facturas');
                setFacturas([]);
            }
        } catch (err) {
            console.error('Error en búsqueda:', err);
            setError(`Error al conectar con el servidor: ${err.message || 'Error desconocido'}`);
            setFacturas([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para limpiar el formulario
    const resetForm = () => {
        form.resetFields();
        setFacturas([]);
        setHasSearched(false);
        setError(null);
    };

    // Función para ver detalles de una factura
    const verDetalleFactura = async (factura) => {
        setLoading(true);

        try {
            // Si la factura ya tiene los productos completos
            if (factura.Productos && Array.isArray(factura.Productos) && factura.Productos.length > 0) {
                setFacturaSeleccionada({
                    ...factura,
                    Fecha: adaptarFecha(factura.Fecha, 'frontend')
                });
                setModalVisible(true);
                return;
            }

            // Si necesitamos consultar la factura completa
            const response = await facturaService.getFacturaByFolio(factura.Folio);

            if (response?.data?.success) {
                // La factura puede estar en diferentes ubicaciones en la respuesta
                let facturaDetalle = null;

                if (response.data.factura) {
                    facturaDetalle = response.data.factura;
                } else if (response.data.data && response.data.data.factura) {
                    facturaDetalle = response.data.data.factura;
                } else {
                    facturaDetalle = factura; // Usar la factura original si no hay detalle
                }

                // Asegurarse que Productos sea un array
                if (!facturaDetalle.Productos) {
                    facturaDetalle.Productos = [{
                        CodProd: facturaDetalle.CodProd || factura.CodProd,
                        DetProd: facturaDetalle.DetProd || factura.DetProd
                    }];
                }

                // Formatear fecha
                facturaDetalle.Fecha = adaptarFecha(facturaDetalle.Fecha, 'frontend');

                setFacturaSeleccionada(facturaDetalle);
                setModalVisible(true);
            } else {
                message.error(response?.data?.message || 'Error al cargar los detalles de la factura');
            }
        } catch (err) {
            console.error('Error al obtener detalle:', err);
            message.error(`Error al cargar detalles: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Función simulada para exportar a Excel
    const exportarExcel = () => {
        setExportando(true);
        message.loading('Preparando archivo Excel...', 1.5)
            .then(() => {
                message.success('Excel generado correctamente');
                setExportando(false);
            });
    };

    // Función simulada para exportar a PDF
    const exportarPDF = () => {
        setExportando(true);
        message.loading('Preparando archivo PDF...', 1.5)
            .then(() => {
                message.success('PDF generado correctamente');
                setExportando(false);
            });
    };

    // Definición de columnas para la tabla
    const columns = [
        {
            title: 'Folio',
            dataIndex: 'Folio',
            key: 'Folio',
            width: 120,
            sorter: (a, b) => a.Folio - b.Folio
        },
        {
            title: 'Fecha',
            dataIndex: 'Fecha',
            key: 'Fecha',
            width: 120,
            render: (text) => text || 'N/A',
            sorter: (a, b) => moment(a.Fecha, 'DD/MM/YYYY').unix() - moment(b.Fecha, 'DD/MM/YYYY').unix()
        },
        {
            title: 'Cliente',
            dataIndex: 'NomAux',
            key: 'NomAux',
            width: 200,
            render: (text, record) => (
                <div>
                    <div>{text || 'N/A'}</div>
                    {record.RutAux && <small style={{ color: '#888' }}>RUT: {formatRut(record.RutAux)}</small>}
                </div>
            )
        },
        {
            title: 'Código Producto',
            dataIndex: 'CodProd',
            key: 'CodProd',
            width: 120
        },
        {
            title: 'Descripción',
            dataIndex: 'DetProd',
            key: 'DetProd',
            width: 200,
            ellipsis: true
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => verDetalleFactura(record)}
                >
                    Ver
                </Button>
            )
        },
    ];

    // Componente Modal para detalles de factura
    const FacturaModal = ({ visible, onCancel, factura }) => (
        <Modal
            title={`Detalle de Factura ${factura?.Folio || ''}`}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>Cerrar</Button>,
                <Button
                    key="pdf"
                    icon={<FilePdfOutlined />}
                    onClick={() => {
                        message.info('Exportar PDF en desarrollo');
                        onCancel();
                    }}
                >
                    Exportar PDF
                </Button>
            ]}
            width={800}
        >
            {factura ? (
                <>
                    <Descriptions title="Información General" bordered column={2}>
                        <Descriptions.Item label="Folio">{factura.Folio || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Fecha">{factura.Fecha || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="RUT Cliente">{formatRut(factura.RutAux) || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Código Cliente">{factura.CodAux || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Cliente" span={2}>{factura.NomAux || 'N/A'}</Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Title level={5}>Detalle de Productos</Title>
                    <Table
                        dataSource={factura.Productos || [{ CodProd: factura.CodProd, DetProd: factura.DetProd }].filter(p => p.CodProd || p.DetProd)}
                        rowKey={(record, index) => `item-${index}`}
                        pagination={false}
                        size="small"
                        columns={[
                            { title: 'Código', dataIndex: 'CodProd', key: 'codigo' },
                            { title: 'Descripción', dataIndex: 'DetProd', key: 'descripcion' }
                        ]}
                        locale={{ emptyText: <Empty description="No hay detalles disponibles" /> }}
                    />
                </>
            ) : (
                <Empty description="No hay información disponible" />
            )}
        </Modal>
    );

    return (
        <div className="factura-busqueda">
            <Title level={2}>Búsqueda Avanzada de Facturas</Title>

            {/* Formulario de búsqueda */}
            <Card style={{ marginBottom: 16 }}>
                <Form form={form} layout="vertical" onFinish={buscarFacturas}>
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="searchText" label="Búsqueda Global">
                                <Input placeholder="Buscar en todos los campos" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="folio" label="Folio">
                                <Input placeholder="Ej: 938412" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="rutAux" label="RUT Cliente">
                                <Input placeholder="Ej: 95.623.000-0" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="nomAux" label="Nombre Cliente">
                                <Input placeholder="Ej: Sodimac" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="fechaRango" label="Rango de Fechas">
                                <RangePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="codProd" label="Código Producto">
                                <Input placeholder="Código del producto" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="detProd" label="Descripción Producto">
                                <Input placeholder="Ej: Congelador" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Space>
                                <Button
                                    type="default"
                                    onClick={resetForm}
                                    icon={<ReloadOutlined />}
                                >
                                    Limpiar
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SearchOutlined />}
                                    loading={loading}
                                >
                                    Buscar
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Alertas de error */}
            {error && (
                <Alert
                    message="Error al buscar facturas"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                    action={<Button size="small" danger onClick={() => setError(null)}>Cerrar</Button>}
                />
            )}

            {/* Mensaje inicial */}
            {!hasSearched && !loading && !error && (
                <Alert
                    message="Información"
                    description="Utilice los filtros para buscar facturas. Puede buscar por cliente, folio, fecha, productos y más."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* Tabla de resultados */}
            <Card
                title="Resultados de la búsqueda"
                extra={
                    <Space>
                        <Button
                            type="primary"
                            icon={<FileExcelOutlined />}
                            onClick={exportarExcel}
                            disabled={facturas.length === 0 || exportando}
                        >
                            Exportar Excel
                        </Button>
                        <Button
                            icon={<FilePdfOutlined />}
                            onClick={exportarPDF}
                            disabled={facturas.length === 0 || exportando}
                        >
                            Exportar PDF
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={facturas}
                    rowKey={(record) => `${record.Folio}-${record.CodProd || ''}`}
                    loading={loading}
                    pagination={pagination}
                    onChange={(newPagination) => setPagination(newPagination)}
                    scroll={{ x: 1000 }}
                    locale={{
                        emptyText: hasSearched
                            ? <Empty description="No hay facturas disponibles con los criterios de búsqueda" />
                            : <Empty description="Utilice los filtros para buscar facturas" />
                    }}
                />
            </Card>

            {/* Modal de detalles de factura */}
            <FacturaModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                factura={facturaSeleccionada}
            />
        </div>
    );
};

export default FacturaBusqueda;