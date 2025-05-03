import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Select, Typography, message, Card, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import clienteService from '../../services/clienteService';
import { REGIONES, COMUNAS_POR_REGION } from "../../utils/ubicacion";
import { formatRut } from "../../utils/formatters";

const { Title } = Typography;
const { Option } = Select;

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
    const cargarComunas = useCallback((regionId) => {
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
    }, []);

    // Manejar cambio de región
    const handleRegionChange = useCallback((value) => {
        setSelectedRegion(value);
        form.setFieldsValue({ comuna: undefined });
        cargarComunas(value);
    }, [form, cargarComunas]);

    // Cargar datos del cliente
    useEffect(() => {
        const fetchClienteData = async () => {
            try {
                setInitialLoading(true);
                const response = await clienteService.getClienteById(codaux);

                if (response?.success && response.cliente) {
                    const clienteData = response.cliente;
                    setClienteOriginal(clienteData);

                    if (clienteData) {
                        // Formatear el RUT para mostrarlo
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
                        throw new Error("No se recibieron datos válidos del cliente");
                    }
                } else {
                    throw new Error(response?.message || "No se encontraron datos del cliente");
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                message.error("Error al obtener los datos del cliente");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchClienteData();
    }, [codaux, form, cargarComunas]);

    // Enviar datos actualizados
    const onFinish = async (values) => {
        try {
            setLoading(true);

            // Crear copia para no modificar el objeto original
            const dataToSend = { ...values };

            // Eliminar campos que no deben enviarse o que son solo visuales
            if (dataToSend.rut_formateado) {
                delete dataToSend.rut_formateado;
            }

            const response = await clienteService.updateCliente(codaux, dataToSend);

            if (response?.success) {
                message.success('Cliente actualizado exitosamente');
                navigate(`/clientes/${codaux}`);
            } else {
                throw new Error(response?.message || "Error al actualizar el cliente");
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            message.error(error.message || 'Error al actualizar el cliente');
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
                        codaux: '',
                        rut_formateado: '',
                        nombre: '',
                        direccion: '',
                        numero: '',
                        fono: '',
                        region: undefined,
                        comuna: undefined,
                        ciudad: '',
                        correoelectronico: '',
                        tipo: undefined
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
                        name="correoelectronico"
                        label="Correo Electrónico"
                        rules={[
                            {
                                type: 'email',
                                message: 'Ingrese un correo electrónico válido',
                            }
                        ]}
                    >
                        <Input placeholder="ejemplo@correo.com" />
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

                    <Form.Item
                        name="tipo"
                        label="Tipo de Cliente"
                    >
                        <Select placeholder="Seleccione un tipo de cliente" allowClear>
                            <Option value="Final">Final</Option>
                            <Option value="Retail">Retail</Option>
                            <Option value="Distribuidor">Distribuidor</Option>

                        </Select>
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