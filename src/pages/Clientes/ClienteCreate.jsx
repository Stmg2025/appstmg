import React, { useState } from 'react';
import { Form, Input, Button, Select, Typography, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import clienteService from '../../services/clienteService';

const { Title } = Typography;
const { Option } = Select;

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

const ClienteCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [comunas, setComunas] = useState([]);
    const [loadingComunas, setLoadingComunas] = useState(false);

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

    // Preparar datos antes de enviar al servidor
    const prepararDatosParaEnviar = (values) => {
        const datosPreparados = { ...values };

        // Formatear RUT (codaux) - guardar sin puntos ni guión, solo números
        if (values.rut) {
            datosPreparados.rut = values.rut.replace(/\./g, '').replace(/-/g, '');
        }

        return datosPreparados;
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);

            if (values.rut && !validarRut(values.rut)) {
                message.error('El RUT ingresado no es válido');
                setLoading(false);
                return;
            }

            const datosPreparados = prepararDatosParaEnviar(values);
            console.log("Datos a enviar:", datosPreparados);

            const response = await clienteService.createCliente(datosPreparados);

            if (response?.success) {
                message.success('Cliente creado exitosamente');
                navigate('/clientes');
            } else {
                throw new Error(response?.message || "Error al crear el cliente.");
            }
        } catch (error) {
            console.error('Error al crear cliente:', error);
            message.error(error.message || 'Error al crear el cliente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2}>Crear Nuevo Cliente</Title>

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
                        label="Código Auxiliar"
                        rules={[{ required: true, message: 'Por favor ingresa el código auxiliar' }]}
                    >
                        <Input placeholder="Código único para identificar al cliente" />
                    </Form.Item>

                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingresa el nombre del cliente' }]}
                    >
                        <Input placeholder="Nombre completo del cliente" />
                    </Form.Item>

                    <Form.Item
                        name="rut"
                        label="RUT"
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
                        name="direccion"
                        label="Dirección"
                    >
                        <Input placeholder="Calle o avenida" />
                    </Form.Item>

                    <Form.Item
                        name="numero"
                        label="Número"
                    >
                        <Input placeholder="Número de casa o departamento" />
                    </Form.Item>

                    <Form.Item
                        name="fono"
                        label="Teléfono"
                    >
                        <Input placeholder="Teléfono de contacto" />
                    </Form.Item>

                    <Form.Item
                        name="region"
                        label="Región"
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
                                <Option key={comuna.id} value={comuna.nombre}>
                                    {comuna.nombre}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="ciudad"
                        label="Ciudad"
                    >
                        <Input placeholder="Ciudad" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Crear Cliente
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => navigate('/clientes')}
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

export default ClienteCreate;