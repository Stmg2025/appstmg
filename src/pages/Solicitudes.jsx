import React, { useEffect, useState, useContext } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, message, Popconfirm,
    Card, Space, DatePicker, Tooltip, Tag, Typography, Row, Col
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
    FileTextOutlined, ReloadOutlined, EyeOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';
import DetalleSolicitud from '../components/DetalleSolicitud';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const Solicitudes = () => {
    const { user } = useContext(AuthContext);
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
    const [search, setSearch] = useState('');
    const [form] = Form.useForm();
    const [detalleVisible, setDetalleVisible] = useState(false);
    const [solicitudDetalle, setSolicitudDetalle] = useState(null);
    const [filters, setFilters] = useState({
        estado: [],
        tipo: []
    });

    // Verifica si el usuario es técnico
    const esTecnico = user?.user?.cargo.trim() === 'Técnico';

    useEffect(() => {
        cargarSolicitudes();
    }, [pagination.page, filters]);

    // Función para búsqueda que opera en el frontend
    const buscarSolicitudes = async () => {
        if (!search.trim()) {
            cargarSolicitudes();
            return;
        }

        setLoading(true);
        try {
            // Cargamos todas las solicitudes y filtramos en el cliente
            const response = await axios.get('https://stmg.cl/node-server/api/solicitudes', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            console.log("Respuesta de búsqueda:", response.data);

            // Procesamos los datos igual que en cargarSolicitudes
            let datosSolicitudes = [];

            if (Array.isArray(response.data)) {
                datosSolicitudes = response.data;
            } else if (response.data && Array.isArray(response.data.solicitudes)) {
                datosSolicitudes = response.data.solicitudes;
            } else if (response.data && typeof response.data === 'object') {
                datosSolicitudes = [response.data];
            }

            if (datosSolicitudes.length > 0) {
                // Mapeamos las columnas de la base de datos a nuestro modelo de datos
                const solicitudesMapeadas = datosSolicitudes.map(item => ({
                    id: item.id,
                    codaux: item.codaux || '',
                    nomaux: item.nomaux || '',
                    titulo: item.desc_motivo || 'Sin título',
                    descripcion: item.desc_motivo || '',
                    tipo: mapearTipo(item.tipo || item.tipo_motivo || ''),
                    estado: mapearEstado(item.estado || ''),
                    creada_por: item.creada_por || '',
                    fecha: item.fecha || new Date().toISOString(),
                    direccion: item.dir_visita || '',
                    region: item.region || '',
                    comuna: item.comuna || '',
                    area_trab: item.area_trab || '',
                    codigo_falla: item.codigo_falla || '',
                    nro_serie: item.nro_serie || '',
                    tecnico_cierre: item.tecnico_cierre || '',
                    fecha_cierre: item.fec_cierre || null,
                    fecha_real_cierre: item.fec_real_cierre || null,
                    motivo_estado: item.motivo_estado || '',
                    prioridad: determinarPrioridad(item.tipo_motivo, item.estado)
                }));

                // Filtramos localmente según el término de búsqueda
                const searchTerm = search.toLowerCase();
                const filteredData = solicitudesMapeadas.filter(item => {
                    return (
                        (item.titulo && item.titulo.toLowerCase().includes(searchTerm)) ||
                        (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm)) ||
                        (item.codaux && item.codaux.toLowerCase().includes(searchTerm)) ||
                        (item.nomaux && item.nomaux.toLowerCase().includes(searchTerm)) ||
                        (item.creada_por && item.creada_por.toLowerCase().includes(searchTerm)) ||
                        (item.estado && item.estado.toLowerCase().includes(searchTerm)) ||
                        (item.direccion && item.direccion.toLowerCase().includes(searchTerm)) ||
                        (item.region && item.region.toLowerCase().includes(searchTerm)) ||
                        (item.comuna && item.comuna.toLowerCase().includes(searchTerm)) ||
                        (item.codigo_falla && item.codigo_falla.toLowerCase().includes(searchTerm)) ||
                        (item.nro_serie && item.nro_serie.toLowerCase().includes(searchTerm)) ||
                        (String(item.id).includes(searchTerm))
                    );
                });

                // Ordenar por fecha (más nuevas primero)
                const datosOrdenados = filteredData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setSolicitudes(datosOrdenados);
                setPagination(prev => ({
                    ...prev,
                    total: datosOrdenados.length,
                    page: 1
                }));

                if (datosOrdenados.length === 0) {
                    message.info(`No se encontraron resultados para "${search}"`);
                } else {
                    message.success(`Se encontraron ${datosOrdenados.length} resultados para "${search}"`);
                }
            } else {
                setSolicitudes([]);
                setPagination(prev => ({
                    ...prev,
                    total: 0,
                    page: 1
                }));
                message.info(`No se encontraron resultados para "${search}"`);
            }
        } catch (error) {
            console.error("Error buscando solicitudes:", error);
            message.error("No se pudieron buscar las solicitudes.");
        } finally {
            setLoading(false);
        }
    };

    const cargarSolicitudes = async () => {
        setLoading(true);
        try {
            // Simplificamos la petición al máximo para diagnosticar problemas
            const response = await axios.get('https://stmg.cl/node-server/api/solicitudes', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            console.log("Respuesta cruda del servidor:", response.data);

            // Adaptamos para la estructura real de tu base de datos
            let datosSolicitudes = [];

            if (Array.isArray(response.data)) {
                // Si la respuesta es directamente un array
                datosSolicitudes = response.data;
            } else if (response.data && Array.isArray(response.data.solicitudes)) {
                // Si la respuesta tiene un objeto solicitudes que es un array
                datosSolicitudes = response.data.solicitudes;
            } else if (response.data && typeof response.data === 'object') {
                // Si la respuesta es un objeto pero no tiene el formato esperado
                console.log("Formato de respuesta no esperado, intentando adaptar");
                datosSolicitudes = [response.data]; // Intentamos tratar como una sola solicitud
            }

            if (datosSolicitudes.length > 0) {
                // Mapeamos las columnas de la base de datos a nuestro modelo de datos
                const solicitudesMapeadas = datosSolicitudes.map(item => ({
                    id: item.id,
                    codaux: item.codaux || '',
                    nomaux: item.nomaux || '',
                    descripcion: item.desc_motivo || 'Sin descripción', // Usamos desc_motivo directamente
                    tipo: mapearTipo(item.tipo || item.tipo_motivo || ''),
                    estado: mapearEstado(item.estado || ''),
                    creada_por: item.creada_por || '',
                    fecha: item.fecha || new Date().toISOString(),
                    direccion: item.dir_visita || '',
                    region: item.region || '',
                    comuna: item.comuna || '',
                    area_trab: item.area_trab || '',
                    codigo_falla: item.codigo_falla || '',
                    nro_serie: item.nro_serie || '',
                    tecnico_cierre: item.tecnico_cierre || '',
                    fecha_cierre: item.fec_cierre || null,
                    fecha_real_cierre: item.fec_real_cierre || null,
                    motivo_estado: item.motivo_estado || '',
                    prioridad: determinarPrioridad(item.tipo_motivo, item.estado)
                }));

                // Ordenamos por fecha (más nuevas primero)
                const datosOrdenados = solicitudesMapeadas.sort((a, b) =>
                    new Date(b.fecha) - new Date(a.fecha)
                );

                setSolicitudes(datosOrdenados);
                setPagination(prev => ({
                    ...prev,
                    total: datosOrdenados.length
                }));

                console.log("Datos procesados:", datosOrdenados);
            } else {
                console.log("No se encontraron solicitudes en la respuesta");
                setSolicitudes([]);
            }
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
            message.error("No se pudieron cargar las solicitudes.");
        } finally {
            setLoading(false);
        }
    };

    // Función para mapear el tipo de solicitud según la base de datos
    const mapearTipo = (tipo) => {
        // Mapear según el valor de tipo o tipo_motivo
        switch (tipo) {
            case '1': return 'instalacion';
            case '2': return 'reparacion';
            case '3': return 'mantenimiento';
            case '4': return 'revision';
            case 'I': return 'instalacion';
            case 'R': return 'reparacion';
            case 'M': return 'mantenimiento';
            case 'V': return 'revision';
            default: return tipo.toLowerCase(); // Devolvemos el tipo original si no hay mapeo
        }
    };

    // Función para mapear el estado según la base de datos
    const mapearEstado = (estado) => {
        // Mapear según el valor de estado
        switch (estado) {
            case '01': case '1': return 'pendiente';
            case '02': case '2': return 'en proceso';
            case '03': case '3': return 'completado';
            case '04': case '4': return 'cancelado';
            default: return estado.toLowerCase(); // Devolvemos el estado original si no hay mapeo
        }
    };

    // Función para determinar la prioridad basada en tipo y estado
    const determinarPrioridad = (tipo, estado) => {
        // Ejemplo simple: 
        // Urgente para ciertas instalaciones, alta para reparaciones en proceso, etc.
        if (tipo === 'I' && estado === '01') return 'alta';
        if (tipo === 'R') return 'media';
        return 'normal';
    };

    const handleResetFilters = () => {
        setFilters({
            estado: [],
            tipo: []
        });
        setSearch('');
        cargarSolicitudes();
    };

    const mostrarModal = (solicitud = null) => {
        setSelectedSolicitud(solicitud);
        form.resetFields();
        if (solicitud) {
            form.setFieldsValue({
                titulo: solicitud.titulo,
                descripcion: solicitud.descripcion,
                tipo: solicitud.tipo,
                estado: solicitud.estado,
                prioridad: solicitud.prioridad || 'normal',
                codaux: solicitud.codaux,
                nomaux: solicitud.nomaux
            });
        }
        setModalOpen(true);
    };

    const manejarEnvio = async (values) => {
        setLoading(true);
        try {
            // Agregar campos adicionales si es una nueva solicitud
            if (!selectedSolicitud) {
                values.creada_por = `${user.user.nombre} ${user.user.apellido}`;
                values.fecha = dayjs().format('YYYY-MM-DD HH:mm:ss');
            }

            if (selectedSolicitud) {
                await axios.put(`https://stmg.cl/node-server/api/solicitudes/${selectedSolicitud.id}`, values, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                message.success("Solicitud actualizada con éxito.");
            } else {
                await axios.post('https://stmg.cl/node-server/api/solicitudes', values, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                message.success("Solicitud creada con éxito.");
            }
            setModalOpen(false);
            form.resetFields();
            cargarSolicitudes();
        } catch (error) {
            console.error("Error guardando la solicitud:", error);
            message.error("No se pudo guardar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    const manejarEliminar = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://stmg.cl/node-server/api/solicitudes/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            message.success("Solicitud eliminada.");
            cargarSolicitudes();
        } catch (error) {
            console.error("Error eliminando la solicitud:", error);
            message.error("No se pudo eliminar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    const verDetalle = (solicitud) => {
        setSolicitudDetalle(solicitud);
        setDetalleVisible(true);
    };

    // Renderizar el estado con colores
    const renderEstado = (estado) => {
        let color = 'default';
        switch (estado.toLowerCase()) {
            case 'pendiente':
                color = 'gold';
                break;
            case 'en proceso':
                color = 'blue';
                break;
            case 'completado':
                color = 'green';
                break;
            case 'cancelado':
                color = 'red';
                break;
            default:
                color = 'default';
        }
        return (
            <Tag color={color} style={{ minWidth: '90px', textAlign: 'center' }}>
                {estado.toUpperCase()}
            </Tag>
        );
    };

    // Renderizar la prioridad
    const renderPrioridad = (prioridad) => {
        if (!prioridad) return <Tag>NORMAL</Tag>;

        switch (prioridad.toLowerCase()) {
            case 'alta':
                return <Tag color="red">ALTA</Tag>;
            case 'media':
                return <Tag color="orange">MEDIA</Tag>;
            case 'baja':
                return <Tag color="green">BAJA</Tag>;
            default:
                return <Tag>NORMAL</Tag>;
        }
    };

    const columnas = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            ellipsis: true,
            render: (text, record) => (
                <Text
                    strong
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                    onClick={() => verDetalle(record)}
                >
                    {text || 'Sin descripción'}
                </Text>
            )
        },
        {
            title: 'Nombre Auxiliar',
            dataIndex: 'nomaux',
            key: 'nomaux',
            width: 180
        },
        {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
            width: 120,
            render: (tipo) => {
                const tipoCapitalizado = tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : 'N/A';
                return (
                    <Tag color="blue">{tipoCapitalizado}</Tag>
                );
            }
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            width: 120,
            render: renderEstado
        },
        {
            title: 'Creada Por',
            dataIndex: 'creada_por',
            key: 'creada_por',
            width: 150
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
            width: 150,
            render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => new Date(b.fecha) - new Date(a.fecha),
            defaultSortOrder: 'descend'
        },
        {
            title: 'Acciones',
            key: 'acciones',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Ver detalle">
                        <Button
                            type="default"
                            icon={<EyeOutlined />}
                            onClick={() => verDetalle(record)}
                            size="small"
                        />
                    </Tooltip>
                    {!esTecnico && (
                        <>
                            <Tooltip title="Editar">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => verDetalle(record)}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="Eliminar">
                                <Popconfirm
                                    title="¿Eliminar solicitud?"
                                    description="Esta acción no se puede deshacer"
                                    onConfirm={() => manejarEliminar(record.id)}
                                    okText="Sí"
                                    cancelText="No"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                    />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}
                </Space>
            )
        }
    ];

    const handleDetalleFinish = (actualizada) => {
        setDetalleVisible(false);
        if (actualizada) {
            cargarSolicitudes();
        }
    };

    return (
        <div style={{ padding: 0 }}>
            <Card style={{ marginBottom: 20, borderRadius: 8 }}>
                <Row gutter={16} align="middle">
                    <Col xs={24} md={12} lg={8}>
                        <Title level={4} style={{ margin: 0 }}>
                            <FileTextOutlined /> Gestión de Solicitudes
                        </Title>
                    </Col>
                    <Col xs={24} md={12} lg={16}>
                        <Space wrap>
                            <Input
                                placeholder="Buscar solicitud..."
                                prefix={<SearchOutlined />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onPressEnter={buscarSolicitudes}
                                allowClear
                                style={{ width: 250 }}
                            />

                            <Select
                                mode="multiple"
                                placeholder="Filtrar por estado"
                                value={filters.estado}
                                onChange={(value) => setFilters({ ...filters, estado: value })}
                                style={{ minWidth: 180 }}
                                allowClear
                            >
                                <Option value="pendiente">Pendiente</Option>
                                <Option value="en proceso">En Proceso</Option>
                                <Option value="completado">Completado</Option>
                                <Option value="cancelado">Cancelado</Option>
                            </Select>

                            <Select
                                mode="multiple"
                                placeholder="Filtrar por tipo"
                                value={filters.tipo}
                                onChange={(value) => setFilters({ ...filters, tipo: value })}
                                style={{ minWidth: 180 }}
                                allowClear
                            >
                                <Option value="instalacion">Instalación</Option>
                                <Option value="reparacion">Reparación</Option>
                                <Option value="mantenimiento">Mantenimiento</Option>
                                <Option value="revision">Revisión</Option>
                            </Select>

                            <Button
                                icon={<SearchOutlined />}
                                onClick={buscarSolicitudes}
                                type="primary"
                            >
                                Buscar
                            </Button>

                            <Tooltip title="Restablecer filtros">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleResetFilters}
                                />
                            </Tooltip>

                            {!esTecnico && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => mostrarModal()}
                                    style={{ background: '#ff0000', borderColor: '#ff0000' }}
                                >
                                    Nueva Solicitud
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ borderRadius: 8 }}>
                <Table
                    columns={columnas}
                    dataSource={solicitudes}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        current: pagination.page,
                        total: pagination.total,
                        pageSize: pagination.limit,
                        onChange: (page) => setPagination(prev => ({ ...prev, page })),
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        onShowSizeChange: (current, size) => setPagination(prev => ({ ...prev, limit: size })),
                        showTotal: (total) => `Total: ${total} solicitudes`
                    }}
                    scroll={{ x: 1200 }}
                    locale={{
                        emptyText: 'No hay solicitudes para mostrar'
                    }}
                />
            </Card>

            {/* Modal de crear/editar solicitud */}
            <Modal
                title={
                    <Space>
                        {selectedSolicitud ? <EditOutlined /> : <PlusOutlined />}
                        {selectedSolicitud ? "Editar Solicitud" : "Nueva Solicitud"}
                    </Space>
                }
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
                width={700}
                maskClosable={false}
            >
                <Form form={form} layout="vertical" onFinish={manejarEnvio}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="titulo"
                                label="Título"
                                rules={[{ required: true, message: "El título es obligatorio" }]}
                            >
                                <Input placeholder="Título de la solicitud" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="codaux"
                                label="Código Auxiliar"
                                rules={[{ required: true, message: "El código auxiliar es obligatorio" }]}
                            >
                                <Input placeholder="Ej: AUX-001" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="nomaux"
                                label="Nombre Auxiliar"
                                rules={[{ required: true, message: "El nombre auxiliar es obligatorio" }]}
                            >
                                <Input placeholder="Nombre del auxiliar" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="tipo"
                                label="Tipo"
                                rules={[{ required: true, message: "El tipo es obligatorio" }]}
                            >
                                <Select placeholder="Seleccione tipo">
                                    <Option value="instalacion">Instalación</Option>
                                    <Option value="reparacion">Reparación</Option>
                                    <Option value="mantenimiento">Mantenimiento</Option>
                                    <Option value="revision">Revisión</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="estado"
                                label="Estado"
                                rules={[{ required: true, message: "El estado es obligatorio" }]}
                                initialValue="pendiente"
                            >
                                <Select placeholder="Seleccione estado">
                                    <Option value="pendiente">Pendiente</Option>
                                    <Option value="en proceso">En Proceso</Option>
                                    <Option value="completado">Completado</Option>
                                    <Option value="cancelado">Cancelado</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="prioridad"
                                label="Prioridad"
                                initialValue="normal"
                            >
                                <Select placeholder="Seleccione prioridad">
                                    <Option value="alta">Alta</Option>
                                    <Option value="media">Media</Option>
                                    <Option value="normal">Normal</Option>
                                    <Option value="baja">Baja</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: "La descripción es obligatoria" }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Describa los detalles de la solicitud"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Componente de Detalle Solicitud */}
            {detalleVisible && (
                <DetalleSolicitud
                    visible={detalleVisible}
                    solicitud={solicitudDetalle}
                    onClose={() => setDetalleVisible(false)}
                    onFinish={handleDetalleFinish}
                    esEditable={!esTecnico}
                />
            )}
        </div>
    );
};

export default Solicitudes;