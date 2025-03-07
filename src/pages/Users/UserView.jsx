import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import userService from '../../services/userService';
import roleService from '../../services/roleService';

const { Title } = Typography;

const UserView = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // Obtener datos del usuario
                const userResponse = await userService.getUserById(id);

                if (userResponse.data.success) {
                    setUser(userResponse.data.user);

                    // Obtener información del rol
                    try {
                        const roleResponse = await roleService.getRoleById(userResponse.data.user.role_id);
                        if (roleResponse.data.success) {
                            setRole(roleResponse.data.role);
                        }
                    } catch (roleError) {
                        console.error('Error al obtener información del rol:', roleError);
                    }
                } else {
                    message.error('Error al cargar los datos del usuario');
                }
            } catch (error) {
                console.error('Error al obtener usuario:', error);
                message.error('Error al cargar los datos del usuario');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!user) {
        return (
            <div>
                <Title level={3}>Usuario no encontrado</Title>
                <Link to="/users">
                    <Button type="primary">Volver a la lista</Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Title level={2}>Detalle del Usuario</Title>
                <div>
                    <Link to="/users">
                        <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 8 }}>
                            Volver
                        </Button>
                    </Link>
                    <Link to={`/users/edit/${id}`}>
                        <Button type="primary" icon={<EditOutlined />}>
                            Editar
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
                    <Descriptions.Item label="Nombre Completo">{`${user.first_name} ${user.last_name}`}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="RUT">{user.rut}</Descriptions.Item>
                    <Descriptions.Item label="Teléfono">{user.phone_number}</Descriptions.Item>
                    <Descriptions.Item label="Fecha de Nacimiento">{user.fecha_nacimiento}</Descriptions.Item>
                    <Descriptions.Item label="Cargo">{user.cargo}</Descriptions.Item>
                    <Descriptions.Item label="Rol">{role ? role.nombre : `ID: ${user.role_id}`}</Descriptions.Item>
                    <Descriptions.Item label="Estado">
                        <span style={{ color: user.is_active ? 'green' : 'red' }}>
                            {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default UserView;