import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import roleService from '../../services/roleService';

const { Title } = Typography;

const RoleEdit = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();

    // Cargar datos del rol
    useEffect(() => {
        const fetchRoleData = async () => {
            try {
                setInitialLoading(true);
                const response = await roleService.getRoleById(id);

                if (response.data && response.data.success && response.data.role) {
                    // Inicializar el formulario con los datos del rol
                    form.setFieldsValue(response.data.role);
                } else {
                    message.error('Error al cargar los datos del rol');
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                message.error('Error al cargar los datos del rol');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchRoleData();
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await roleService.updateRole(id, values);

            if (response.data && response.data.success) {
                message.success('Rol actualizado exitosamente');
                navigate(`/roles/${id}`);
            } else {
                message.error('Error al actualizar el rol');
            }
        } catch (error) {
            console.error('Error al actualizar rol:', error);
            message.error('Error al actualizar el rol');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2}>Editar Rol</Title>

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
                        Actualizar Rol
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate(`/roles/${id}`)}
                    >
                        Cancelar
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RoleEdit;