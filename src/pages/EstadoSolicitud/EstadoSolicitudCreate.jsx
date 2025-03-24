import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import estadoSolicitudService from '../../services/estadoSolicitudService';

const { Title } = Typography;

const EstadoSolicitudCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await estadoSolicitudService.createEstado(values);

            if (response.data.success) {
                message.success('Estado creado exitosamente');
                navigate('/estados-solicitud');
            } else {
                message.error('Error al crear el estado');
            }
        } catch (error) {
            console.error('Error al crear estado:', error);
            message.error('Error al crear el estado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2}>Crear Nuevo Estado de Solicitud</Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
            >
                <Form.Item
                    name="nombre"
                    label="Nombre del Estado"
                    rules={[{ required: true, message: 'Por favor ingresa el nombre del estado' }]}
                >
                    <Input placeholder="Ej: Abierta, En Proceso, Cerrada..." />
                </Form.Item>

                <Form.Item
                    name="descripcion"
                    label="Descripción"
                    rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
                >
                    <Input.TextArea
                        placeholder="Descripción del estado de la solicitud"
                        rows={4}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Crear Estado
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate('/estados-solicitud')}
                    >
                        Cancelar
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EstadoSolicitudCreate;
