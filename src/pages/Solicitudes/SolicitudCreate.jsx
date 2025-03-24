import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Typography, message, Card, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SolicitudCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
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
                    // Si no hay estados, mostrar mensaje informativo
                    if (response?.status !== 503) { // No mostrar para errores de servicio no disponible
                        message.info('No se pudieron cargar los estados. Algunas funciones podrían estar limitadas.');
                    }
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

    const onFinish = async (values) => {
        try {
            setLoading(true);
            console.log("Datos a enviar:", values);

            const response = await solicitudService.createSolicitud(values);

            if (response?.data?.success) {
                message.success('Solicitud creada exitosamente');
                navigate('/solicitudes');
            } else {
                throw new Error(response?.data?.message || "Error al crear la solicitud.");
            }
        } catch (error) {
            console.error('Error al crear solicitud:', error);
            message.error(error.message || 'Error al crear la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2}>Crear Nueva Solicitud</Title>

            <Card style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
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

                    {/* Campo para asignar técnico */}
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

                    {/* Campos opcionales para solicitudes tipo "F" (Facturado) */}
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
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </>
                            ) : null
                        }
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Crear Solicitud
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => navigate('/solicitudes')}
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

export default SolicitudCreate;