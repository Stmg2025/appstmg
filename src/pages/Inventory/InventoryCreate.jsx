import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Typography, message, Upload } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import inventoryService from '../../services/inventoryService';

const { Title } = Typography;

const InventoryCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = ({ file }) => {
        setFile(file.originFileObj);
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);

            // Crear FormData para enviar datos y archivo
            const formData = new FormData();
            formData.append("codigo", values.codigo);
            formData.append("descripcion", values.descripcion);
            formData.append("ubicacion", values.ubicacion);
            formData.append("valor", values.valor);
            formData.append("costo", values.costo);
            formData.append("stock", values.stock);

            // Añadir imagen si existe
            if (file) {
                formData.append("imagen", file);
            }

            const response = await inventoryService.createInventoryItem(formData);

            if (response.data.success) {
                message.success('Item agregado exitosamente');
                navigate('/inventory');
            } else {
                message.error('Error al agregar el item');
            }
        } catch (error) {
            console.error('Error al crear item de inventario:', error);
            message.error('Error al agregar el item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2}>Agregar Nuevo Item al Inventario</Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
                encType="multipart/form-data"
            >
                <Form.Item
                    name="codigo"
                    label="Código"
                    rules={[{ required: true, message: 'Por favor ingresa el código del item' }]}
                >
                    <Input placeholder="Ej: RP001" />
                </Form.Item>

                <Form.Item
                    name="descripcion"
                    label="Descripción"
                    rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
                >
                    <Input.TextArea
                        placeholder="Descripción detallada del item"
                        rows={3}
                    />
                </Form.Item>

                <Form.Item
                    name="ubicacion"
                    label="Ubicación"
                    rules={[{ required: true, message: 'Por favor ingresa la ubicación del item' }]}
                >
                    <Input placeholder="Ej: Bodega 1, Estante A-12" />
                </Form.Item>

                <Form.Item
                    name="valor"
                    label="Valor (Precio de Venta)"
                    rules={[{ required: true, message: 'Por favor ingresa el valor del item' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        min={0}
                        placeholder="Valor en pesos"
                    />
                </Form.Item>

                <Form.Item
                    name="costo"
                    label="Costo (Precio de Compra)"
                    rules={[{ required: true, message: 'Por favor ingresa el costo del item' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        min={0}
                        placeholder="Costo en pesos"
                    />
                </Form.Item>

                <Form.Item
                    name="stock"
                    label="Stock"
                    rules={[{ required: true, message: 'Por favor ingresa el stock' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="Cantidad disponible"
                    />
                </Form.Item>

                <Form.Item label="Imagen del Repuesto">
                    <Upload
                        beforeUpload={() => false}
                        onChange={handleFileChange}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Seleccionar Imagen</Button>
                    </Upload>
                    {file && <p>{file.name}</p>}
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Agregar Item
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate('/inventory')}
                    >
                        Cancelar
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default InventoryCreate;