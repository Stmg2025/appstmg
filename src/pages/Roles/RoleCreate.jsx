import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import roleService from '../../services/roleService';

const { Title } = Typography;

const RoleCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await roleService.createRole(values);

            if (response.data.success) {
                message.success('Rol creado exitosamente');
                navigate('/roles');
            } else {
                message.error('Error al crear el rol');
            }
        } catch (error) {
            console.error('Error al crear rol:', error);
            message.error('Error al crear el rol');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2}>Crear Nuevo Rol</Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
            >
                <Form.Item
                    name="nombre"
                    label="Nombre del Rol"
                    rules={[{ required: true, message: 'Por favor ingresa el nombre del rol' }]}
                >
                    <Input placeholder="Ej: Supervisor, Gerente, etc." />
                </Form.Item>

                <Form.Item
                    name="descripcion"
                    label="Descripción"
                    rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
                >
                    <Input.TextArea
                        placeholder="Describe las funciones y alcance de este rol"
                        rows={4}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Crear Rol
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate('/roles')}
                    >
                        Cancelar
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RoleCreate;