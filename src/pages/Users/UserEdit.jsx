import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Typography, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import userService from '../../services/userService';
import roleService from '../../services/roleService';

const { Title } = Typography;
const { Option } = Select;

const UserEdit = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    // Cargar datos del usuario y roles
    useEffect(() => {
        const fetchData = async () => {
            try {
                setInitialLoading(true);

                // Cargar roles
                try {
                    const rolesResponse = await roleService.getRoles();
                    if (rolesResponse.data && rolesResponse.data.success) {
                        setRoles(rolesResponse.data.roles || []);
                    }
                } catch (roleError) {
                    console.error('Error al cargar roles:', roleError);
                }

                // Cargar datos del usuario
                try {
                    const userResponse = await userService.getUserById(id);
                    console.log('Respuesta API usuario:', userResponse.data);

                    if (userResponse.data && userResponse.data.user) {
                        const userData = userResponse.data.user;
                        console.log('Datos del usuario a cargar:', userData);

                        // Convertir explícitamente role_id a número si viene como string
                        if (userData.role_id && typeof userData.role_id === 'string') {
                            userData.role_id = parseInt(userData.role_id, 10);
                        }

                        // Convertir explícitamente is_active a número si viene como string o boolean
                        if (userData.is_active !== undefined) {
                            userData.is_active = typeof userData.is_active === 'boolean'
                                ? (userData.is_active ? 1 : 0)
                                : parseInt(userData.is_active, 10);
                        }

                        // Dar formato a la fecha para el DatePicker
                        let formattedUser = { ...userData };

                        if (userData.fecha_nacimiento) {
                            const fechaNacimiento = moment(userData.fecha_nacimiento);
                            if (fechaNacimiento.isValid()) {
                                formattedUser.fecha_nacimiento = fechaNacimiento;
                            }
                        }

                        console.log('Datos formateados para el formulario:', formattedUser);

                        // Inicializar el formulario con los datos del usuario
                        form.setFieldsValue(formattedUser);
                    } else {
                        message.error('No se pudieron cargar los datos del usuario');
                    }
                } catch (userError) {
                    console.error('Error al cargar usuario:', userError);
                    message.error('Error al cargar los datos del usuario');
                }
            } catch (error) {
                console.error('Error general:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchData();
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);

            // Crear copia de los valores para no modificar el objeto original
            const dataToSend = { ...values };

            // Formatear fecha de nacimiento
            if (dataToSend.fecha_nacimiento) {
                dataToSend.fecha_nacimiento = dataToSend.fecha_nacimiento.format('YYYY-MM-DD');
            }

            // Eliminar el campo de contraseña si está vacío
            if (!dataToSend.password) {
                delete dataToSend.password;
            }

            console.log('Datos a enviar:', dataToSend);

            const response = await userService.updateUser(id, dataToSend);

            if (response.data && response.data.success) {
                message.success('Usuario actualizado exitosamente');
                navigate(`/users/${id}`);
            } else {
                message.error('Error al actualizar el usuario');
            }
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            message.error('Error al actualizar el usuario');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2}>Editar Usuario</Title>

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
                    label="Contraseña (dejar en blanco para mantener la actual)"
                    rules={[
                        { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                    ]}
                >
                    <Input.Password placeholder="Nueva contraseña (opcional)" />
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

                <Form.Item
                    name="is_active"
                    label="Estado"
                    rules={[{ required: true, message: 'Por favor selecciona el estado' }]}
                >
                    <Select placeholder="Selecciona el estado">
                        <Option value={1}>Activo</Option>
                        <Option value={0}>Inactivo</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Actualizar Usuario
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate(`/users/${id}`)}
                    >
                        Cancelar
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default UserEdit;