import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Typography, message, Card, DatePicker, Space, Badge, Row, Col, Divider, AutoComplete, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import solicitudService from '../../services/solicitudService';
import tecnicoService from '../../services/tecnicoService';
import estadoSolicitudService from '../../services/estadoSolicitudService';
import clienteService from '../../services/clienteService';
import { useAuth } from '../../context/AuthContext';
import { COMUNAS_POR_REGION, formatRut, limpiarRut, validarRut, garantiaActiva } from './constants';

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
    const [comunas, setComunas] = useState([]);
    const [loadingComunas, setLoadingComunas] = useState(false);
    const [fechaFactura, setFechaFactura] = useState(null);
    const [clienteOptions, setClienteOptions] = useState([]);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const { user } = useAuth();

    // Establecer creada_por automáticamente
    useEffect(() => {
        if (user && user.first_name && user.last_name) {
            form.setFieldsValue({
                creada_por: `${user.first_name} ${user.last_name}`
            });
        }
    }, [user, form]);

    // Cargar técnicos
    useEffect(() => {
        const fetchTecnicos = async () => {
            try {
                setLoadingTecnicos(true);
                const response = await tecnicoService.getTecnicos();
                setTecnicos(response?.data?.success && Array.isArray(response.data.tecnicos) ? response.data.tecnicos : []);
            } catch (error) {
                console.error('Error al cargar técnicos:', error);
                setTecnicos([]);
            } finally {
                setLoadingTecnicos(false);
            }
        };
        fetchTecnicos();
    }, []);

    // Cargar estados
    useEffect(() => {
        const fetchEstados = async () => {
            try {
                setLoadingEstados(true);
                const response = await estadoSolicitudService.getEstados();
                setEstados(response?.data?.success && Array.isArray(response.data.estados) ? response.data.estados : []);
                if (!(response?.data?.success) && response?.status !== 503) {
                    message.info('No se pudieron cargar los estados');
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

    // Cargar comunas
    const cargarComunas = (regionId) => {
        if (!regionId) {
            setComunas([]);
            return;
        }
        try {
            setLoadingComunas(true);
            const comunasList = COMUNAS_POR_REGION[regionId] || [];
            setComunas(comunasList);
            if (comunasList.length === 0) {
                message.info(`No hay comunas disponibles para la región seleccionada`);
            }
        } catch (error) {
            console.error('Error al cargar comunas:', error);
            setComunas([]);
        } finally {
            setLoadingComunas(false);
        }
    };

    const handleRegionChange = (value) => {
        form.setFieldsValue({ comuna: undefined });
        cargarComunas(value);
    };

    const handleFechaFacturaChange = (date) => {
        setFechaFactura(date);
    };

    // Buscar cliente
    const handleSearchCliente = async (value) => {
        if (!value || value.length < 3) {
            setClienteOptions([]);
            return;
        }
        try {
            setLoadingClientes(true);
            const response = await clienteService.searchClientes({ searchText: value });
            if (response?.data?.success && Array.isArray(response.data.clientes)) {
                setClienteOptions(response.data.clientes.map(cliente => ({
                    value: formatRut(cliente.codaux),
                    text: `${formatRut(cliente.codaux)} - ${cliente.nomaux}`,
                    cliente: cliente
                })));
            } else {
                setClienteOptions([]);
            }
        } catch (error) {
            console.error('Error al buscar clientes:', error);
            setClienteOptions([]);
        } finally {
            setLoadingClientes(false);
        }
    };

    // Seleccionar cliente
    const handleSelectCliente = (value, option) => {
        if (!option.cliente) return;

        const cliente = option.cliente;
        form.setFieldsValue({
            nomaux: cliente.nomaux,
            tipo_cliente: cliente.tipo_cliente,
            dir_visita: cliente.direccion || '',
            region: cliente.region,
            comuna: cliente.comuna,
            nombre: cliente.nombre || '',
            telefono: cliente.telefono || '',
            mail: cliente.mail || ''
        });

        if (cliente.region) cargarComunas(cliente.region);
    };

    // Buscar cliente por RUT
    const handleRutChange = async (value) => {
        if (!value || !validarRut(value)) return;

        try {
            const rutLimpio = limpiarRut(value).slice(0, -1);
            const response = await clienteService.getClienteById(rutLimpio);

            if (response?.data?.success && response.data.cliente) {
                const cliente = response.data.cliente;
                form.setFieldsValue({
                    nomaux: cliente.nomaux,
                    tipo_cliente: cliente.tipo_cliente,
                    dir_visita: cliente.direccion || '',
                    region: cliente.region,
                    comuna: cliente.comuna,
                    nombre: cliente.nombre || '',
                    telefono: cliente.telefono || '',
                    mail: cliente.mail || ''
                });

                if (cliente.region) cargarComunas(cliente.region);
                message.success('Datos del cliente cargados');
            }
        } catch (error) {
            console.error('Error al obtener cliente por RUT:', error);
        }
    };

    // Preparar datos para enviar
    const prepararDatosParaEnviar = (values) => {
        const datosPreparados = { ...values };

        // Formatear RUT
        if (values.codaux) {
            datosPreparados.codaux = limpiarRut(values.codaux).slice(0, -1);
        }

        // Formatear fechas
        if (values.fecha_fact && moment.isMoment(values.fecha_fact)) {
            datosPreparados.fecha_fact = values.fecha_fact.format('YYYY-MM-DD');
        }

        if (values.fecha_agendamiento && moment.isMoment(values.fecha_agendamiento)) {
            datosPreparados.fecha_agendamiento = values.fecha_agendamiento.format('YYYY-MM-DD');
        }

        // Convertir booleanos a 'S'/'N'
        ['cliente_contactado', 'distribuidor_contactado', 'tecnico_confirmado', 'reporte_enviado'].forEach(campo => {
            if (datosPreparados[campo] !== undefined) {
                datosPreparados[campo] = datosPreparados[campo] ? 'S' : 'N';
            }
        });

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
                    initialValues={{
                        cliente_contactado: false,
                        distribuidor_contactado: false,
                        tecnico_confirmado: false,
                        reporte_enviado: false
                    }}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Divider orientation="left">Información del Cliente</Divider>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="codaux" label="RUT Cliente" rules={[{ validator: (_, value) => !value || validarRut(value) ? Promise.resolve() : Promise.reject('RUT inválido') }]} normalize={formatRut}>
                                <AutoComplete
                                    options={clienteOptions}
                                    onSearch={handleSearchCliente}
                                    onSelect={handleSelectCliente}
                                    onChange={handleRutChange}
                                    placeholder="Ej: 12.345.678-9"
                                    notFoundContent={loadingClientes ? <span>Cargando...</span> : null}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="nomaux" label="Nombre Cliente">
                                <Input placeholder="Nombre completo del cliente" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="tipo_cliente" label="Tipo de Cliente">
                                <Select placeholder="Seleccione tipo de cliente">
                                    <Option value="Final">Final</Option>
                                    <Option value="Retail">Retail</Option>
                                    <Option value="Distribuidor">Distribuidor</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="facturable" label="¿Es Facturable?">
                                <Select placeholder="Seleccione facturable">
                                    <Option value="Si">Si</Option>
                                    <Option value="Garantia">Garantía</Option>
                                    <Option value="Cortesia">Cortesía</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Campos de contacto */}
                        <Col xs={24} md={8}>
                            <Form.Item name="nombre" label="Nombre Contacto">
                                <Input placeholder="Nombre de contacto" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="telefono" label="Teléfono">
                                <Input placeholder="Teléfono" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="mail" label="Email" rules={[{ type: 'email', message: 'Email inválido' }]}>
                                <Input placeholder="Email" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Divider orientation="left">Información de la Solicitud</Divider>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="tipo" label="Tipo de Solicitud" rules={[{ required: true, message: 'Campo requerido' }]}>
                                <Select placeholder="Seleccione tipo">
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
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="prioridad" label="Prioridad">
                                <Select placeholder="Seleccione prioridad">
                                    <Option value="Normal">Normal</Option>
                                    <Option value="Urgente">Urgente</Option>
                                    <Option value="Atrasado">Atrasada</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="ejecucion" label="Ejecución">
                                <Select placeholder="Seleccione ejecución">
                                    <Option value="Interna">Interna</Option>
                                    <Option value="Externa">Externa</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item name="desc_motivo" label="Descripción Motivo" rules={[{ required: true, message: 'Campo requerido' }]}>
                                <TextArea rows={3} placeholder="Descripción detallada" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="creada_por" label="Creada Por" rules={[{ required: true }]}>
                                <Input disabled />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Divider orientation="left">Estado y Asignación</Divider>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="estado_id" label="Estado" rules={[{ required: true, message: 'Campo requerido' }]}>
                                <Select
                                    placeholder="Seleccione estado"
                                    loading={loadingEstados}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {estados.map(estado => (
                                        <Option key={estado.id} value={estado.id}>
                                            {estado.nombre || `Estado ${estado.id}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="motivo_estado" label="Motivo del Estado">
                                <Input placeholder="Motivo del estado" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="tecnico_asignado" label="Técnico Asignado">
                                <Select
                                    placeholder="Seleccione técnico"
                                    allowClear
                                    loading={loadingTecnicos}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {tecnicos.map(tecnico => (
                                        <Option key={tecnico.id} value={tecnico.id}>
                                            {tecnico.nombre_completo || `Técnico ${tecnico.id}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="fecha_agendamiento" label="Fecha Agendamiento">
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>

                        {/* Estados de seguimiento */}
                        <Col xs={24}>
                            <Divider orientation="left">Seguimiento</Divider>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="cliente_contactado" label="Cliente Contactado" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="distribuidor_contactado" label="Distribuidor Contactado" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="tecnico_confirmado" label="Técnico Confirmado" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="reporte_enviado" label="Reporte Enviado" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Divider orientation="left">Ubicación</Divider>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="area_trab" label="Área de Trabajo" rules={[{ required: true, message: 'Campo requerido' }]}>
                                <Select placeholder="Seleccione área">
                                    <Option value="TERRENO">Terreno</Option>
                                    <Option value="PLANTA">Taller</Option>
                                    <Option value="REMOTO">Remoto</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={16}>
                            <Form.Item name="dir_visita" label="Dirección Visita" rules={[{ required: true, message: 'Campo requerido' }]}>
                                <Input placeholder="Dirección completa" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="region" label="Región" rules={[{ required: true, message: 'Campo requerido' }]}>
                                <Select placeholder="Seleccione región" onChange={handleRegionChange} showSearch optionFilterProp="children">
                                    <Option value="15">Arica y Parinacota</Option>
                                    <Option value="1">Tarapacá</Option>
                                    <Option value="2">Antofagasta</Option>
                                    <Option value="3">Atacama</Option>
                                    <Option value="4">Coquimbo</Option>
                                    <Option value="5">Valparaíso</Option>
                                    <Option value="13">Metropolitana</Option>
                                    <Option value="6">O'Higgins</Option>
                                    <Option value="7">Maule</Option>
                                    <Option value="16">Ñuble</Option>
                                    <Option value="8">Biobío</Option>
                                    <Option value="9">La Araucanía</Option>
                                    <Option value="14">Los Ríos</Option>
                                    <Option value="10">Los Lagos</Option>
                                    <Option value="11">Aysén</Option>
                                    <Option value="12">Magallanes</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="comuna" label="Comuna" rules={[{ required: true, message: 'Campo requerido' }]}>
                                <Select
                                    placeholder="Seleccione comuna"
                                    loading={loadingComunas}
                                    disabled={comunas.length === 0}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {comunas.map(comuna => (
                                        <Option key={comuna.id} value={comuna.id}>{comuna.nombre}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Divider orientation="left">Producto y Facturación</Divider>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="codprod" label="Código Producto">
                                <Input placeholder="Código producto" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="desprod" label="Descripción Producto">
                                <Input placeholder="Descripción producto" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="nro_serie" label="Número Serie">
                                <Input placeholder="Número serie" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="factura" label="Número Factura">
                                <Input placeholder="Número factura" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item
                                name="fecha_fact"
                                label="Fecha Factura"
                                extra={fechaFactura && (
                                    <Space>
                                        <span>Garantía:</span>
                                        <Badge status={garantiaActiva(fechaFactura) ? "success" : "error"} text={garantiaActiva(fechaFactura) ? "Activa" : "Vencida"} />
                                    </Space>
                                )}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    onChange={handleFechaFacturaChange}
                                    format="YYYY-MM-DD"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="factura_dist" label="Factura Distribuidor">
                                <Input type="number" placeholder="Factura distribuidor" />
                            </Form.Item>
                        </Col>

                        <Col span={24} style={{ textAlign: 'right', marginTop: 16 }}>
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
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default SolicitudCreate;