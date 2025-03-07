import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import userService from '../../services/userService';
import roleService from '../../services/roleService';

const { Title } = Typography;
const { Option } = Select;

const UserCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    // Cargar roles para el selector
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await roleService.getRoles();
                if (response.data.success) {
                    setRoles(response.data.roles);
                }
            } catch (error) {
                console.error('Error al cargar roles:', error);
                message.error('Error al cargar los roles disponibles');
            }
        };

        fetchRoles();
    }, []);

    const onFinish = async (values) => {
        try {
            setLoading(true);

            // Formatear fecha de nacimiento
            if (values.fecha_nacimiento) {
                values.fecha_nacimiento = values.fecha_nacimiento.format('YYYY-MM-DD');
            }

            const response = await userService.createUser(values);

            if (response.data.success) {
                message.success('Usuario creado exitosamente');
                navigate('/users');
            } else {
                message.error('Error al crear el usuario');
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            message.error('Error al crear el usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2}>Crear Nuevo Usuario</Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
            >
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Por favor ingresa un email' },
                        { type: 'email', message: 'Ingresa un email válido' }
                    ]}
                >
                    <Input placeholder="usuario@stmg.cl" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Contraseña"
                    rules={[
                        { required: true, message: 'Por favor ingresa una contraseña' },
                        { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                    ]}
                >
                    <Input.Password placeholder="Contraseña" />
                </Form.Item>

                <Form.Item
                    name="first_name"
                    label="Nombre"
                    rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
                >
                    <Input placeholder="Nombre" />
                </Form.Item>

                <Form.Item
                    name="last_name"
                    label="Apellido"
                    rules={[{ required: true, message: 'Por favor ingresa el apellido' }]}
                >
                    <Input placeholder="Apellido" />
                </Form.Item>

                <Form.Item
                    name="rut"
                    label="RUT"
                    rules={[{ required: true, message: 'Por favor ingresa el RUT' }]}
                >
                    <Input placeholder="12345678-9" />
                </Form.Item>

                <Form.Item
                    name="phone_number"
                    label="Teléfono"
                    rules={[{ required: true, message: 'Por favor ingresa el teléfono' }]}
                >
                    <Input placeholder="+56912345678" />
                </Form.Item>

                <Form.Item
                    name="fecha_nacimiento"
                    label="Fecha de Nacimiento"
                    rules={[{ required: true, message: 'Por favor selecciona la fecha de nacimiento' }]}
                >
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item
                    name="cargo"
                    label="Cargo"
                    rules={[{ required: true, message: 'Por favor ingresa el cargo' }]}
                >
                    <Input placeholder="Técnico, Asistente, etc." />
                </Form.Item>

                <Form.Item
                    name="role_id"
                    label="Rol"
                    rules={[{ required: true, message: 'Por favor selecciona un rol' }]}
                >
                    <Select placeholder="Selecciona un rol">
                        {roles.map(role => (
                            <Option key={role.id} value={role.id}>{role.nombre}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Crear Usuario
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate('/users')}
                    >
                        Cancelar
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default UserCreate;