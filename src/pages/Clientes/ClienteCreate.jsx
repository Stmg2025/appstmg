import React, { useState, useCallback } from 'react';
import { Form, Input, Button, Select, Typography, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import clienteService from '../../services/clienteService';
import { REGIONES, COMUNAS_POR_REGION } from "../../utils/ubicacion";
import { formatRut, validarRut } from "../../utils/formatters";

const { Title } = Typography;
const { Option } = Select;

const ClienteCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [comunas, setComunas] = useState([]);
    const [loadingComunas, setLoadingComunas] = useState(false);

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
        form.setFieldsValue({ comuna: undefined });
        cargarComunas(value);
    }, [form, cargarComunas]);

    // Preparar datos antes de enviar al servidor
    const prepararDatosParaEnviar = useCallback((values) => {
        const datosPreparados = { ...values };

        // Formatear RUT (codaux) - guardar sin puntos ni guión, solo números
        if (values.rut) {
            datosPreparados.rut = values.rut.replace(/\./g, '').replace(/-/g, '');
        }

        return datosPreparados;
    }, []);

    const onFinish = async (values) => {
        try {
            setLoading(true);

            if (values.rut && !validarRut(values.rut)) {
                message.error('El RUT ingresado no es válido');
                setLoading(false);
                return;
            }

            const datosPreparados = prepararDatosParaEnviar(values);
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

                    <Form.Item
                        name="tipo"
                        label="Tipo de Cliente"
                    >
                        <Select placeholder="Seleccione un tipo de cliente">
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