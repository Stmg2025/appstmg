import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Typography, message, Card, DatePicker, Space, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

// Datos estáticos de comunas por región
const COMUNAS_POR_REGION = {
    '13': [
        { id: '13301', nombre: 'Santiago' },
        { id: '13302', nombre: 'Providencia' },
        { id: '13303', nombre: 'Las Condes' }
    ],
    '5': [
        { id: '5101', nombre: 'Valparaíso' },
        { id: '5102', nombre: 'Viña del Mar' },
        { id: '5103', nombre: 'Quilpué' }
    ],
    '8': [
        { id: '8101', nombre: 'Concepción' },
        { id: '8102', nombre: 'Talcahuano' },
        { id: '8103', nombre: 'Chiguayante' }
    ]
};

// Función para validar y formatear RUT chileno
const formatRut = (rut) => {
    if (!rut) return '';

    // Eliminar caracteres no numéricos
    let valor = rut.replace(/[^0-9kK]/g, '');

    // Obtener dígito verificador
    let dv = valor.charAt(valor.length - 1);

    // Obtener cuerpo del RUT
    let rutCuerpo = valor.slice(0, -1);

    // Formatear con puntos y guión
    let rutFormateado = '';
    for (let i = rutCuerpo.length - 1; i >= 0; i--) {
        rutFormateado = rutCuerpo.charAt(i) + rutFormateado;
        if ((rutCuerpo.length - i) % 3 === 0 && i !== 0) {
            rutFormateado = '.' + rutFormateado;
        }
    }

    return rutFormateado + '-' + dv;
};

// Función para calcular el dígito verificador
const calcularDV = (rut) => {
    let suma = 0;
    let multiplo = 2;

    for (let i = rut.length - 1; i >= 0; i--) {
        suma += parseInt(rut.charAt(i)) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    let dvCalculado = 11 - (suma % 11);

    if (dvCalculado === 11) return '0';
    if (dvCalculado === 10) return 'K';

    return dvCalculado.toString();
};

// Función para validar un RUT completo
const validarRut = (rut) => {
    if (!rut) return false;

    // Limpiar el RUT de cualquier formato
    let valor = rut.replace(/\./g, '').replace(/-/g, '');

    // Obtener dígito verificador ingresado
    let dv = valor.charAt(valor.length - 1).toUpperCase();

    // Obtener cuerpo del RUT
    let rutCuerpo = valor.slice(0, -1);

    // Calcular dígito verificador esperado
    let dvEsperado = calcularDV(rutCuerpo);

    return dv === dvEsperado;
};

// Función para verificar si la garantía está activa (1 año desde la fecha de factura)
const garantiaActiva = (fechaFactura) => {
    if (!fechaFactura) return false;

    const fechaLimite = moment(fechaFactura).add(1, 'year');
    return moment().isBefore(fechaLimite);
};

const SolicitudCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [tecnicos, setTecnicos] = useState([]);
    const [loadingTecnicos, setLoadingTecnicos] = useState(false);
    const [estados, setEstados] = useState([]);
    const [loadingEstados, setLoadingEstados] = useState(false);
    const [comunas, setComunas] = useState([]);
    const [loadingComunas, setLoadingComunas] = useState(false);
    const [fechaFactura, setFechaFactura] = useState(null);
    const { user } = useAuth();

    // Establecer creada_por automáticamente con datos del usuario
    useEffect(() => {
        if (user && user.first_name && user.last_name) {
            form.setFieldsValue({
                creada_por: `${user.first_name} ${user.last_name}`
            });
        }
    }, [user, form]);

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
                    if (response?.status !== 503) {
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

    // Cargar comunas según la región seleccionada
    const cargarComunas = (regionId) => {
        if (!regionId) {
            setComunas([]);
            return;
        }

        try {
            setLoadingComunas(true);
            if (regionId in COMUNAS_POR_REGION) {
                setComunas(COMUNAS_POR_REGION[regionId]);
            } else {
                setComunas([]);
                message.info(`No hay comunas disponibles para la región seleccionada`);
            }
        } catch (error) {
            console.error('Error al cargar comunas:', error);
            setComunas([]);
        } finally {
            setLoadingComunas(false);
        }
    };

    // Manejar cambio de región
    const handleRegionChange = (value) => {
        form.setFieldsValue({ comuna: undefined });
        cargarComunas(value);
    };

    // Manejar cambio de fecha de factura para verificar garantía
    const handleFechaFacturaChange = (date) => {
        setFechaFactura(date);
    };

    // Preparar datos antes de enviar al servidor
    const prepararDatosParaEnviar = (values) => {
        const datosPreparados = { ...values };

        // Formatear RUT (codaux) - guardar sin puntos ni guión, solo números
        if (values.codaux) {
            datosPreparados.codaux = values.codaux.replace(/\./g, '').replace(/-/g, '').slice(0, -1);
        }

        // Formatear fecha_fact
        if (values.fecha_fact && moment.isMoment(values.fecha_fact)) {
            datosPreparados.fecha_fact = values.fecha_fact.format('YYYY-MM-DD');
        }

        return datosPreparados;
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);

            if (values.codaux && !validarRut(values.codaux)) {
                message.error('El RUT ingresado no es válido');
                setLoading(false);
                return;
            }

            const datosPreparados = prepararDatosParaEnviar(values);
            console.log("Datos a enviar:", datosPreparados);

            const response = await solicitudService.createSolicitud(datosPreparados);

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
                    {/* Información del Cliente */}
                    <Form.Item
                        name="codaux"
                        label="RUT Cliente"
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    return validarRut(value)
                                        ? Promise.resolve()
                                        : Promise.reject('El RUT ingresado no es válido');
                                }
                            }
                        ]}
                        normalize={formatRut}
                    >
                        <Input placeholder="Ej: 12.345.678-9" />
                    </Form.Item>

                    <Form.Item
                        name="nomaux"
                        label="Nombre Cliente"
                    >
                        <Input placeholder="Nombre completo del cliente" />
                    </Form.Item>

                    {/* Información de la Solicitud */}
                    <Form.Item
                        name="tipo"
                        label="Tipo de Solicitud"
                        rules={[{ required: true, message: 'Por favor selecciona el tipo de solicitud' }]}
                    >
                        <Select placeholder="Seleccione el tipo de solicitud">
                            <Option value="Garantia">Garantía</Option>
                            <Option value="Servicio">Servicio</Option>
                            <Option value="Mantenimiento">Mantenimiento</Option>
                            <Option value="Cortesia">Cortesía</Option>
                            <Option value="Instalacion">Instalación</Option>
                            <Option value="Reparacion">Reparación</Option>
                            <Option value="Conversion">Conversión</Option>
                            <Option value="Logistica">Logística</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="desc_motivo"
                        label="Descripción Motivo"
                        rules={[{ required: true, message: 'Por favor ingresa una descripción del motivo' }]}
                    >
                        <TextArea rows={3} placeholder="Descripción detallada del motivo" />
                    </Form.Item>

                    {/* Campo tipo_motivo oculto */}
                    <Form.Item name="tipo_motivo" hidden>
                        <Input />
                    </Form.Item>

                    {/* Campo creada_por deshabilitado (se completa automáticamente) */}
                    <Form.Item
                        name="creada_por"
                        label="Creada Por"
                        rules={[{ required: true, message: 'Usuario que crea la solicitud' }]}
                    >
                        <Input disabled />
                    </Form.Item>

                    {/* Estado de la solicitud */}
                    <Form.Item
                        name="estado_id"
                        label="Estado de Solicitud"
                        rules={[{ required: true, message: 'Por favor selecciona el estado' }]}
                    >
                        <Select
                            placeholder="Seleccione un estado"
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
                            <Option value="TERRENO">Terreno</Option>
                            <Option value="PLANTA">Taller</Option>
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
                        <Select
                            placeholder="Seleccione la región"
                            onChange={handleRegionChange}
                            showSearch
                            optionFilterProp="children"
                        >
                            {Object.entries(REGIONES).map(([key, value]) => (
                                <Option key={key} value={key}>
                                    {value}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="comuna"
                        label="Comuna"
                        rules={[{ required: true, message: 'Por favor selecciona la comuna' }]}
                    >
                        <Select
                            placeholder="Seleccione la comuna"
                            loading={loadingComunas}
                            showSearch
                            optionFilterProp="children"
                            disabled={comunas.length === 0}
                            notFoundContent={loadingComunas ? <span>Cargando...</span> : <span>Seleccione primero una región</span>}
                        >
                            {comunas.map(comuna => (
                                <Option key={comuna.id} value={comuna.id}>
                                    {comuna.nombre}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="nro_serie"
                        label="Número de Serie"
                    >
                        <Input placeholder="Número de serie del equipo" />
                    </Form.Item>

                    <Form.Item
                        name="factura"
                        label="Número de Factura"
                    >
                        <Input placeholder="Número de factura" />
                    </Form.Item>

                    <Form.Item
                        name="fecha_fact"
                        label="Fecha de Factura"
                        extra={
                            fechaFactura && (
                                <Space>
                                    <span>Estado de garantía:</span>
                                    {garantiaActiva(fechaFactura) ? (
                                        <Badge status="success" text="Garantía activa" />
                                    ) : (
                                        <Badge status="error" text="Garantía vencida" />
                                    )}
                                </Space>
                            )
                        }
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            onChange={handleFechaFacturaChange}
                        />
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