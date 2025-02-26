import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Input, Select, Button, Tabs, Descriptions,
    Tag, Space, Row, Col, Divider, Typography, message, Timeline, DatePicker,
    Card
} from 'antd';
import {
    EditOutlined, SaveOutlined, CloseOutlined,
    CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
    FileTextOutlined, UserOutlined, CalendarOutlined, TagOutlined,
    PhoneOutlined, MailOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DetalleSolicitud = ({
    visible,
    solicitud,
    onClose,
    onFinish,
    esEditable = true
}) => {
    const [form] = Form.useForm();
    const [modoEdicion, setModoEdicion] = useState(false);
    const [loading, setLoading] = useState(false);
    const [datosCompletos, setDatosCompletos] = useState(null);

    useEffect(() => {
        if (solicitud && solicitud.id) {
            // En lugar de cargar desde el backend, usamos los datos proporcionados por el componente padre
            setDatosCompletos(solicitud);

            // Inicializar el formulario con los datos disponibles
            form.setFieldsValue({
                titulo: solicitud.titulo || solicitud.desc_motivo || '',
                descripcion: solicitud.descripcion || solicitud.desc_motivo || '',
                tipo: solicitud.tipo || '',
                estado: solicitud.estado || '',
                prioridad: solicitud.prioridad || 'normal',
                codaux: solicitud.codaux || '',
                nomaux: solicitud.nomaux || '',
                observaciones: solicitud.motivo_estado || '',
                direccion: solicitud.direccion || solicitud.dir_visita || '',
                telefono_contacto: solicitud.telefono_contacto || '',
                correo_contacto: solicitud.correo_contacto || '',
                fecha_programada: solicitud.fecha_programada ? dayjs(solicitud.fecha_programada) : null,
                region: solicitud.region || '',
                comuna: solicitud.comuna || '',
                codigo_falla: solicitud.codigo_falla || '',
                nro_serie: solicitud.nro_serie || ''
            });
        }
    }, [solicitud, form]);

    const cargarDetalleSolicitud = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://stmg.cl/node-server/api/solicitudes/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data) {
                setDatosCompletos(response.data);

                // Inicializar el formulario con los datos
                form.setFieldsValue({
                    titulo: response.data.titulo,
                    descripcion: response.data.descripcion,
                    tipo: response.data.tipo,
                    estado: response.data.estado,
                    prioridad: response.data.prioridad || 'normal',
                    codaux: response.data.codaux,
                    nomaux: response.data.nomaux,
                    observaciones: response.data.observaciones || '',
                    direccion: response.data.direccion || '',
                    telefono_contacto: response.data.telefono_contacto || '',
                    correo_contacto: response.data.correo_contacto || '',
                    fecha_programada: response.data.fecha_programada ? dayjs(response.data.fecha_programada) : null
                });
            }
        } catch (error) {
            console.error("Error cargando detalle de solicitud:", error);
            message.error("No se pudo cargar el detalle de la solicitud");
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = () => {
        setModoEdicion(true);
    };

    const handleCancelarEdicion = () => {
        setModoEdicion(false);
        // Restaurar los valores originales
        if (datosCompletos) {
            form.setFieldsValue({
                titulo: datosCompletos.titulo,
                descripcion: datosCompletos.descripcion,
                tipo: datosCompletos.tipo,
                estado: datosCompletos.estado,
                prioridad: datosCompletos.prioridad || 'normal',
                codaux: datosCompletos.codaux,
                nomaux: datosCompletos.nomaux,
                observaciones: datosCompletos.observaciones || '',
                direccion: datosCompletos.direccion || '',
                telefono_contacto: datosCompletos.telefono_contacto || '',
                correo_contacto: datosCompletos.correo_contacto || '',
                fecha_programada: datosCompletos.fecha_programada ? dayjs(datosCompletos.fecha_programada) : null
            });
        }
    };

    const handleGuardar = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Crear el objeto de datos adaptado a la estructura de la base de datos
            const datosSolicitud = {
                id: solicitud.id,
                codaux: values.codaux,
                nomaux: values.nomaux,
                desc_motivo: values.descripcion || values.titulo, // Usamos descripción para desc_motivo
                tipo: convertirTipo(values.tipo), // Convertir a formato de BD
                estado: convertirEstado(values.estado), // Convertir a formato de BD
                dir_visita: values.direccion,
                region: values.region,
                comuna: values.comuna,
                motivo_estado: values.observaciones,
                codigo_falla: values.codigo_falla,
                nro_serie: values.nro_serie
            };

            // Formatear fecha programada si existe
            if (values.fecha_programada) {
                datosSolicitud.fecha_programada = values.fecha_programada.format('YYYY-MM-DD');
            }

            console.log("Datos a enviar al servidor:", datosSolicitud);

            await axios.put(`https://stmg.cl/node-server/api/solicitudes/${solicitud.id}`, datosSolicitud, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            message.success("Solicitud actualizada correctamente");
            setModoEdicion(false);

            // Actualizar los datos locales
            setDatosCompletos({
                ...datosCompletos,
                ...datosSolicitud,
                // Volver a convertir algunos campos para visualización
                titulo: values.titulo,
                descripcion: values.descripcion,
                tipo: values.tipo,
                estado: values.estado,
                direccion: values.direccion
            });

            // Notificar que se realizaron cambios
            onFinish(true);
        } catch (error) {
            console.error("Error guardando solicitud:", error);
            message.error("No se pudo guardar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    // Función para convertir tipo al formato de la BD
    const convertirTipo = (tipo) => {
        switch (tipo) {
            case 'instalacion': return 'I';
            case 'reparacion': return 'R';
            case 'mantenimiento': return 'M';
            case 'revision': return 'V';
            default: return tipo;
        }
    };

    // Función para convertir estado al formato de la BD
    const convertirEstado = (estado) => {
        switch (estado) {
            case 'pendiente': return '01';
            case 'en proceso': return '02';
            case 'completado': return '03';
            case 'cancelado': return '04';
            default: return estado;
        }
    };

    const renderEstadoTag = (estado) => {
        let color = 'default';
        let icon = null;

        switch (estado?.toLowerCase()) {
            case 'pendiente':
                color = 'gold';
                icon = <ClockCircleOutlined />;
                break;
            case 'en proceso':
                color = 'blue';
                icon = <ExclamationCircleOutlined />;
                break;
            case 'completado':
                color = 'green';
                icon = <CheckCircleOutlined />;
                break;
            case 'cancelado':
                color = 'red';
                icon = <CloseOutlined />;
                break;
            default:
                color = 'default';
        }

        return (
            <Tag color={color} icon={icon} style={{ padding: '5px 10px' }}>
                {estado ? estado.toUpperCase() : 'N/A'}
            </Tag>
        );
    };

    const renderPrioridadTag = (prioridad) => {
        let color = 'default';

        switch (prioridad?.toLowerCase()) {
            case 'alta':
                color = 'red';
                break;
            case 'media':
                color = 'orange';
                break;
            case 'baja':
                color = 'green';
                break;
            default:
                color = 'default';
        }

        return (
            <Tag color={color}>
                {prioridad ? prioridad.toUpperCase() : 'NORMAL'}
            </Tag>
        );
    };

    // Historial ficticio (esto deberá ser reemplazado con datos reales del backend)
    const getHistorialItems = () => {
        const historial = datosCompletos?.historial || [];

        if (historial.length === 0) {
            // Si no hay historial, generamos al menos el evento de creación
            return [
                {
                    fecha: datosCompletos?.fecha,
                    accion: 'Solicitud creada',
                    usuario: datosCompletos?.creada_por,
                    color: 'green'
                }
            ];
        }

        return historial;
    };

    return (
        <Modal
            title={
                <Space>
                    <FileTextOutlined />
                    {`Solicitud #${solicitud?.id || ''}`}
                    {datosCompletos?.estado && renderEstadoTag(datosCompletos.estado)}
                </Space>
            }
            open={visible}
            onCancel={() => {
                if (modoEdicion) {
                    Modal.confirm({
                        title: '¿Seguro que deseas cancelar?',
                        content: 'Los cambios no guardados se perderán',
                        onOk: () => {
                            setModoEdicion(false);
                            onClose();
                        }
                    });
                } else {
                    onClose();
                }
            }}
            width={900}
            footer={
                modoEdicion ? (
                    <Space>
                        <Button onClick={handleCancelarEdicion} icon={<CloseOutlined />}>
                            Cancelar
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleGuardar}
                            loading={loading}
                            icon={<SaveOutlined />}
                            style={{ background: '#ff0000', borderColor: '#ff0000' }}
                        >
                            Guardar Cambios
                        </Button>
                    </Space>
                ) : (
                    <Space>
                        <Button onClick={onClose}>
                            Cerrar
                        </Button>
                        {esEditable && (
                            <Button
                                type="primary"
                                onClick={handleEditar}
                                icon={<EditOutlined />}
                                style={{ background: '#ff0000', borderColor: '#ff0000' }}
                            >
                                Editar
                            </Button>
                        )}
                    </Space>
                )
            }
        >
            <Tabs defaultActiveKey="informacion">
                <TabPane tab="Información General" key="informacion">
                    {modoEdicion ? (
                        <Form
                            form={form}
                            layout="vertical"
                        >
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

                            <Divider orientation="left">Información de Contacto</Divider>

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="direccion"
                                        label="Dirección"
                                    >
                                        <Input placeholder="Dirección del cliente" prefix={<EnvironmentOutlined />} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="telefono_contacto"
                                        label="Teléfono de Contacto"
                                    >
                                        <Input placeholder="Teléfono" prefix={<PhoneOutlined />} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="correo_contacto"
                                        label="Correo de Contacto"
                                        rules={[
                                            { type: 'email', message: 'El formato del correo no es válido' }
                                        ]}
                                    >
                                        <Input placeholder="Correo electrónico" prefix={<MailOutlined />} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Programación</Divider>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="fecha_programada"
                                        label="Fecha Programada"
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="YYYY-MM-DD"
                                            placeholder="Seleccione fecha"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="observaciones"
                                label="Observaciones"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Observaciones adicionales"
                                />
                            </Form.Item>
                        </Form>
                    ) : (
                        <>
                            {datosCompletos ? (
                                <div>
                                    <Descriptions
                                        title="Información de la Solicitud"
                                        bordered
                                        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                                    >
                                        <Descriptions.Item label="ID" span={1}>
                                            {datosCompletos.id}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Código Auxiliar" span={1}>
                                            {datosCompletos.codaux}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Nombre Auxiliar" span={1}>
                                            {datosCompletos.nomaux}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Tipo" span={1}>
                                            {datosCompletos.tipo ? (
                                                <Tag color="blue">
                                                    {datosCompletos.tipo.charAt(0).toUpperCase() + datosCompletos.tipo.slice(1)}
                                                </Tag>
                                            ) : 'N/A'}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Estado" span={1}>
                                            {renderEstadoTag(datosCompletos.estado)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Prioridad" span={1}>
                                            {renderPrioridadTag(datosCompletos.prioridad)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Creado Por" span={1}>
                                            <Space>
                                                <UserOutlined />
                                                {datosCompletos.creada_por}
                                            </Space>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Fecha de Creación" span={1}>
                                            <Space>
                                                <CalendarOutlined />
                                                {dayjs(datosCompletos.fecha).format('DD/MM/YYYY HH:mm')}
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Título" span={3}>
                                            <Title level={4} style={{ margin: 0 }}>
                                                {datosCompletos.titulo}
                                            </Title>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Descripción" span={3}>
                                            <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                                                {datosCompletos.descripcion || 'Sin descripción.'}
                                            </Paragraph>
                                        </Descriptions.Item>

                                        {(datosCompletos.telefono_contacto || datosCompletos.correo_contacto || datosCompletos.direccion) && (
                                            <>
                                                <Descriptions.Item label="Información de Contacto" span={3}>
                                                    <div>
                                                        {datosCompletos.direccion && (
                                                            <p>
                                                                <EnvironmentOutlined /> <strong>Dirección:</strong> {datosCompletos.direccion}
                                                            </p>
                                                        )}
                                                        {datosCompletos.telefono_contacto && (
                                                            <p>
                                                                <PhoneOutlined /> <strong>Teléfono:</strong> {datosCompletos.telefono_contacto}
                                                            </p>
                                                        )}
                                                        {datosCompletos.correo_contacto && (
                                                            <p>
                                                                <MailOutlined /> <strong>Correo:</strong> {datosCompletos.correo_contacto}
                                                            </p>
                                                        )}
                                                    </div>
                                                </Descriptions.Item>
                                            </>
                                        )}

                                        {datosCompletos.fecha_programada && (
                                            <Descriptions.Item label="Fecha Programada" span={3}>
                                                <Tag color="blue" icon={<CalendarOutlined />}>
                                                    {dayjs(datosCompletos.fecha_programada).format('DD/MM/YYYY')}
                                                </Tag>
                                            </Descriptions.Item>
                                        )}

                                        {datosCompletos.observaciones && (
                                            <Descriptions.Item label="Observaciones" span={3}>
                                                <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                                                    {datosCompletos.observaciones}
                                                </Paragraph>
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 20 }}>
                                    <Text type="secondary">Cargando información...</Text>
                                </div>
                            )}
                        </>
                    )}
                </TabPane>

                <TabPane tab="Historial" key="historial">
                    <Card>
                        <Timeline
                            mode="left"
                            items={getHistorialItems().map(item => ({
                                color: item.color || 'blue',
                                label: dayjs(item.fecha).format('DD/MM/YYYY HH:mm'),
                                children: (
                                    <div>
                                        <Text strong>{item.accion}</Text>
                                        <br />
                                        <Text type="secondary">
                                            <UserOutlined /> {item.usuario || 'Sistema'}
                                        </Text>
                                    </div>
                                )
                            }))}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Documentos" key="documentos">
                    <div style={{ padding: 20, textAlign: 'center' }}>
                        <Text type="secondary">No hay documentos adjuntos a esta solicitud.</Text>
                    </div>
                </TabPane>
            </Tabs>
        </Modal>
    );
};

export default DetalleSolicitud;