import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';

const { Title } = Typography;

const InventoryCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await inventoryService.createInventoryItem(values);

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