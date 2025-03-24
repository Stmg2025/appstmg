import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import estadoSolicitudService from '../../services/estadoSolicitudService';

const { Title } = Typography;

const EstadoSolicitudEdit = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEstado = async () => {
            try {
                setInitialLoading(true);
                const response = await estadoSolicitudService.getEstadoById(id);

                if (response.data?.success && response.data.estado) {
                    form.setFieldsValue(response.data.estado);
                } else {
                    message.error('Error al cargar los datos del estado');
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                message.error('Error al cargar los datos del estado');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchEstado();
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await estadoSolicitudService.updateEstado(id, values);

            if (response.data?.success) {
                message.success('Estado actualizado exitosamente');
                navigate(`/estados-solicitud/${id}`);
            } else {
                message.error('Error al actualizar el estado');
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            message.error('Error al actualizar el estado');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2}>Editar Estado de Solicitud</Title>

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
                    <Input placeholder="Ej: Cerrada, En Evaluación..." />
                </Form.Item>

                <Form.Item
                    name="descripcion"
                    label="Descripción"
                    rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
                >
                    <Input.TextArea
                        placeholder="Detalle sobre este estado"
                        rows={4}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Actualizar Estado
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate(`/estados-solicitud/${id}`)}
                    >
                        Cancelar
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EstadoSolicitudEdit;
