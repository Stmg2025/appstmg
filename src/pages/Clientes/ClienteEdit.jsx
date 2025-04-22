import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Typography, message, Card, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
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

// Función para calcular el dígito verificador de un RUT chileno
const calcularDV = (rutNum) => {
    let suma = 0;
    let multiplo = 2;

    // Convertir a string para asegurar que podemos iterar
    let rutStr = String(rutNum);

    for (let i = rutStr.length - 1; i >= 0; i--) {
        suma += parseInt(rutStr.charAt(i)) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    let dvCalculado = 11 - (suma % 11);

    if (dvCalculado === 11) return '0';
    if (dvCalculado === 10) return 'K';

    return dvCalculado.toString();
};

// Función para formatear RUT chileno
const formatRut = (rut) => {
    if (!rut) return '';

    // Limpiar: asegurar que es string y sin puntos ni guiones
    const rutLimpio = String(rut).replace(/\./g, '').replace(/-/g, '');

    // El codaux es el cuerpo del RUT, necesitamos calcular el DV
    const rutSinDV = rutLimpio; // Asumimos que codaux no incluye el DV

    // Calcular el dígito verificador
    const dv = calcularDV(rutSinDV);

    // Formatear con puntos
    let rutFormateado = '';
    let j = 0;

    for (let i = rutSinDV.length - 1; i >= 0; i--) {
        j++;
        rutFormateado = rutSinDV.charAt(i) + rutFormateado;
        if (j % 3 === 0 && i !== 0) {
            rutFormateado = '.' + rutFormateado;
        }
    }

    return rutFormateado + '-' + dv;
};

const ClienteEdit = () => {
    const { codaux } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();
    const [comunas, setComunas] = useState([]);
    const [loadingComunas, setLoadingComunas] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [clienteOriginal, setClienteOriginal] = useState(null);

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
        setSelectedRegion(value);
        form.setFieldsValue({ comuna: undefined });
        cargarComunas(value);
    };

    useEffect(() => {
        const fetchClienteData = async () => {
            try {
                setInitialLoading(true);
                console.log(`Obteniendo datos del cliente con código: ${codaux}`);

                const response = await clienteService.getClienteById(codaux);
                console.log("Respuesta completa del backend:", response);

                if (response?.data?.success && response.data.cliente) {
                    const clienteData = response.data.cliente;
                    setClienteOriginal(clienteData);

                    if (clienteData) {
                        // Formateamos el RUT para mostrarlo
                        const rutFormateado = formatRut(clienteData.codaux);

                        // Crear objeto con los datos para el formulario
                        const formData = {
                            ...clienteData,
                            rut_formateado: rutFormateado
                        };

                        form.setFieldsValue(formData);

                        // Si hay una región, cargar las comunas correspondientes
                        if (clienteData.region) {
                            setSelectedRegion(clienteData.region);
                            cargarComunas(clienteData.region);
                        }

                        message.success('Datos cargados correctamente');
                    } else {
                        throw new Error("El backend no devolvió datos válidos.");
                    }
                } else {
                    throw new Error(response?.data?.message || "No se encontraron datos.");
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                message.error("Error al obtener los datos del cliente.");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchClienteData();
    }, [codaux, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);

            // Crear copia para no modificar el objeto original
            const dataToSend = { ...values };

            // Eliminar campos que no deben enviarse o que son solo visuales
            if (dataToSend.rut_formateado) {
                delete dataToSend.rut_formateado;
            }

            console.log("Datos a enviar:", dataToSend);

            // Llamada al servicio para actualizar el cliente
            const response = await clienteService.updateCliente(codaux, dataToSend);
            console.log("Respuesta de actualización:", response);

            if (response?.data?.success) {
                message.success('Cliente actualizado exitosamente');
                navigate(`/clientes/${codaux}`);
            } else {
                // Mensaje específico si el backend proporciona uno
                const errorMsg = response?.data?.message || "Error al actualizar el cliente.";
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            message.error(error.message || 'Error al actualizar el cliente.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2}>Editar Cliente</Title>

            <Card style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
                    initialValues={{
                        // Valores por defecto (previene warnings de campos no controlados)
                        codaux: '',
                        rut_formateado: '',
                        nombre: '',
                        direccion: '',
                        numero: '',
                        fono: '',
                        region: undefined,
                        comuna: undefined,
                        ciudad: ''
                    }}
                >
                    {/* Campo de código (RUT) deshabilitado */}
                    <Form.Item
                        name="codaux"
                        label="Código Auxiliar (RUT)"
                        tooltip="Este campo no puede ser modificado"
                    >
                        <Input disabled />
                    </Form.Item>

                    {/* Campo para mostrar el RUT formateado (solo visual) */}
                    <Form.Item
                        name="rut_formateado"
                        label="RUT Formateado"
                        tooltip="Este campo es solo para visualización"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingresa el nombre del cliente' }]}
                    >
                        <Input placeholder="Nombre completo del cliente" />
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
                            value={selectedRegion}
                            allowClear
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
                            allowClear
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
                            Actualizar Cliente
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => navigate(`/clientes/${codaux}`)}
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

export default ClienteEdit;