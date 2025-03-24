import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Typography, message, Card, DatePicker, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SolicitudEdit = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();
    const [tecnicos, setTecnicos] = useState([]);
    const [loadingTecnicos, setLoadingTecnicos] = useState(false);
    const [estados, setEstados] = useState([]);
    const [loadingEstados, setLoadingEstados] = useState(false);

    // Cargar técnicos disponibles
    useEffect(() => {
        const fetchTecnicos = async () => {
            try {
                setLoadingTecnicos(true);
                const response = await tecnicoService.getTecnicos();
                if (response?.data?.success && Array.isArray(response.data.tecnicos)) {
                    setTecnicos(response.data.tecnicos);
                } else {
                    console.warn('Formato de respuesta de técnicos inválido:', response.data);
                    setTecnicos([]);
                }
            } catch (error) {
                console.error('Error al cargar técnicos:', error);
                setTecnicos([]);
            } finally {
                setLoadingTecnicos(false);
            }
        };

        fetchTecnicos();
    }, []);

    // Cargar estados disponibles
    useEffect(() => {
        const fetchEstados = async () => {
            try {
                setLoadingEstados(true);
                const response = await estadoSolicitudService.getEstados();
                console.log('Respuesta de estados:', response?.data);

                if (response?.data?.success && Array.isArray(response.data.estados)) {
                    setEstados(response.data.estados);
                } else {
                    console.warn('Formato de respuesta de estados inválido:', response?.data);
                    setEstados([]);
                }
            } catch (error) {
                console.error('Error al cargar estados:', error);
                setEstados([]);
            } finally {
                setLoadingEstados(false);
            }
        };

        fetchEstados();
    }, []);

    // Función para parsear fechas con varios formatos posibles
    const tryParseDate = (dateString) => {
        if (!dateString) return null;

        // Intentar varios formatos comunes
        const formats = ['YYYY-MM-DD', 'DD-MM-YYYY', 'YYYY/MM/DD', 'DD/MM/YYYY'];
        const momentDate = moment(dateString, formats, true);

        return momentDate.isValid() ? momentDate : null;
    };

    useEffect(() => {
        const fetchSolicitudData = async () => {
            try {
                setInitialLoading(true);
                console.log(`Obteniendo datos de la solicitud con ID: ${id}`);

                const response = await solicitudService.getSolicitudById(id);
                console.log("Respuesta del backend:", response?.data);

                if (response?.data?.success && response.data.solicitud) {
                    const solicitudData = response.data.solicitud;

                    if (solicitudData && solicitudData.id) {
                        // Crear objeto con los datos sin formatear fechas primero
                        let formattedData = { ...solicitudData };

                        // Convertir tecnico_asignado a número si existe
                        if (formattedData.tecnico_asignado) {
                            formattedData.tecnico_asignado = Number(formattedData.tecnico_asignado) || null;
                        }

                        // Convertir estado_id a número si existe
                        if (formattedData.estado_id) {
                            formattedData.estado_id = Number(formattedData.estado_id) || null;
                        }

                        // Formatear fechas si existen y son válidas
                        if (solicitudData.fecha_fact) {
                            const fechaFact = tryParseDate(solicitudData.fecha_fact);
                            if (fechaFact) {
                                formattedData.fecha_fact = fechaFact;
                            } else {
                                // Si no es válida, no se incluye en el formulario
                                delete formattedData.fecha_fact;
                            }
                        }

                        if (solicitudData.fecha_estado) {
                            const fechaEstado = tryParseDate(solicitudData.fecha_estado);
                            if (fechaEstado) {
                                formattedData.fecha_estado = fechaEstado;
                            } else {
                                // Si no es válida, no se incluye en el formulario
                                delete formattedData.fecha_estado;
                            }
                        }

                        // Establecer valores en el formulario
                        form.setFieldsValue(formattedData);
                        message.success('Datos cargados correctamente');
                    } else {
                        throw new Error("El backend no devolvió datos válidos.");
                    }
                } else {
                    throw new Error(response?.data?.message || "No se encontraron datos.");
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                message.error("Error al obtener los datos de la solicitud.");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchSolicitudData();
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);

            // Crear copia para no modificar el objeto original
            const dataToSend = { ...values };

            // Formatear fechas para enviar
            if (dataToSend.fecha_fact && moment.isMoment(dataToSend.fecha_fact)) {
                dataToSend.fecha_fact = dataToSend.fecha_fact.format('YYYY-MM-DD');
            }

            if (dataToSend.fecha_estado && moment.isMoment(dataToSend.fecha_estado)) {
                dataToSend.fecha_estado = dataToSend.fecha_estado.format('YYYY-MM-DD');
            }

            // Si el técnico asignado se limpió, enviarlo como null
            if (dataToSend.tecnico_asignado === undefined) {
                dataToSend.tecnico_asignado = null;
            }

            // Si el estado_id se limpió, enviarlo como null
            if (dataToSend.estado_id === undefined) {
                dataToSend.estado_id = null;
            }

            console.log("Datos a enviar:", dataToSend);

            const response = await solicitudService.updateSolicitud(id, dataToSend);

            if (response?.data?.success) {
                message.success('Solicitud actualizada exitosamente');
                navigate(`/solicitudes/${id}`);
            } else {
                throw new Error(response?.data?.message || "Error al actualizar la solicitud.");
            }
        } catch (error) {
            console.error('Error al actualizar solicitud:', error);
            message.error(error.message || 'Error al actualizar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2}>Editar Solicitud</Title>

            <Card style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
                    initialValues={{
                        // Valores por defecto para evitar problemas con campos nulos
                        tecnico_asignado: undefined,
                        estado_id: undefined,
                        fecha_fact: undefined,
                        fecha_estado: undefined
                    }}
                >
                    <Form.Item
                        name="tipo"
                        label="Tipo"
                        rules={[{ required: true, message: 'Por favor selecciona el tipo de solicitud' }]}
                    >
                        <Select placeholder="Seleccione el tipo de solicitud">
                            <Option value="F">Facturado</Option>
                            <Option value="NF">No Facturado</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="desc_motivo"
                        label="Descripción Motivo"
                        rules={[{ required: true, message: 'Por favor ingresa una descripción del motivo' }]}
                    >
                        <TextArea rows={3} placeholder="Descripción detallada del motivo" />
                    </Form.Item>

                    <Form.Item
                        name="tipo_motivo"
                        label="Tipo Motivo"
                        rules={[{ required: true, message: 'Por favor ingresa el tipo de motivo' }]}
                    >
                        <Input placeholder="Ej: Garantía, Reparación, Mantenimiento" />
                    </Form.Item>

                    <Form.Item
                        name="creada_por"
                        label="Creada Por"
                        rules={[{ required: true, message: 'Por favor ingresa quién crea la solicitud' }]}
                    >
                        <Input placeholder="Nombre del creador" />
                    </Form.Item>

                    <Form.Item
                        name="estado"
                        label="Estado (Anterior)"
                        rules={[{ required: true, message: 'Por favor selecciona el estado' }]}
                    >
                        <Select placeholder="Seleccione el estado">
                            <Option value="AP">Aprobada</Option>
                            <Option value="PE">Pendiente</Option>
                            <Option value="CA">Cancelada</Option>
                            <Option value="FI">Finalizada</Option>
                        </Select>
                    </Form.Item>

                    {/* Estado asignado - mejorado */}
                    <Form.Item
                        name="estado_id"
                        label="Estado Asignado"
                    >
                        <Select
                            placeholder="Seleccione un estado"
                            allowClear
                            loading={loadingEstados}
                            showSearch
                            optionFilterProp="children"
                            notFoundContent={loadingEstados ? <span>Cargando...</span> : <span>No hay estados disponibles</span>}
                        >
                            {(estados || []).map(estado => (
                                <Option key={estado.id} value={estado.id}>
                                    {estado.nombre || `Estado ${estado.id}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Campo para asignar técnico - mejorado */}
                    <Form.Item
                        name="tecnico_asignado"
                        label="Técnico Asignado"
                    >
                        <Select
                            placeholder="Seleccione un técnico"
                            allowClear
                            loading={loadingTecnicos}
                            showSearch
                            optionFilterProp="children"
                            notFoundContent={loadingTecnicos ? <span>Cargando...</span> : <span>No hay técnicos disponibles</span>}
                        >
                            {(tecnicos || []).map(tecnico => (
                                <Option key={tecnico.id} value={tecnico.id}>
                                    {tecnico.nombre_completo || `Técnico ${tecnico.id}`} - {tecnico.especialidad || 'Sin especialidad'}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="area_trab"
                        label="Área de Trabajo"
                        rules={[{ required: true, message: 'Por favor selecciona el área de trabajo' }]}
                    >
                        <Select placeholder="Seleccione el área de trabajo">
                            <Option value="OFICINA">Oficina</Option>
                            <Option value="TERRENO">Terreno</Option>
                            <Option value="REMOTO">Remoto</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dir_visita"
                        label="Dirección Visita"
                        rules={[{ required: true, message: 'Por favor ingresa la dirección de visita' }]}
                    >
                        <Input placeholder="Dirección completa" />
                    </Form.Item>

                    <Form.Item
                        name="region"
                        label="Región"
                        rules={[{ required: true, message: 'Por favor selecciona la región' }]}
                    >
                        <Select placeholder="Seleccione la región">
                            <Option value="13">Metropolitana</Option>
                            <Option value="5">Valparaíso</Option>
                            <Option value="8">Biobío</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="comuna"
                        label="Comuna"
                        rules={[{ required: true, message: 'Por favor selecciona la comuna' }]}
                    >
                        <Select placeholder="Seleccione la comuna">
                            <Option value="13301">Santiago</Option>
                            <Option value="13302">Providencia</Option>
                            <Option value="13303">Las Condes</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="nro_serie"
                        label="Número de Serie"
                    >
                        <Input placeholder="Número de serie del equipo" />
                    </Form.Item>

                    <Form.Item
                        name="codigo_falla"
                        label="Código de Falla"
                    >
                        <Input placeholder="Código de falla reportado" />
                    </Form.Item>

                    {/* Campos para solicitudes tipo "F" (Facturado) */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.tipo !== currentValues.tipo}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('tipo') === 'F' ? (
                                <>
                                    <Form.Item
                                        name="factura"
                                        label="Número de Factura"
                                    >
                                        <Input placeholder="Número de factura" />
                                    </Form.Item>

                                    <Form.Item
                                        name="fecha_fact"
                                        label="Fecha de Factura"
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="YYYY-MM-DD"
                                        />
                                    </Form.Item>
                                </>
                            ) : null
                        }
                    </Form.Item>

                    <Form.Item
                        name="motivo_estado"
                        label="Motivo de Estado"
                    >
                        <Input placeholder="Razón del estado actual" />
                    </Form.Item>

                    <Form.Item
                        name="fecha_estado"
                        label="Fecha de Estado"
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item
                        name="tecnico_cierre"
                        label="Técnico de Cierre"
                    >
                        <Input placeholder="Nombre del técnico que cierra" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Actualizar Solicitud
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => navigate(`/solicitudes/${id}`)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SolicitudEdit;