import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import roleService from '../../services/roleService';

const { Title } = Typography;

const RoleView = () => {
    const { id } = useParams();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoleData = async () => {
            try {
                setLoading(true);
                const response = await roleService.getRoleById(id);

                if (response.data.success) {
                    setRole(response.data.role);
                } else {
                    message.error('Error al cargar los datos del rol');
                }
            } catch (error) {
                console.error('Error al obtener rol:', error);
                message.error('Error al cargar los datos del rol');
            } finally {
                setLoading(false);
            }
        };

        fetchRoleData();
    }, [id]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!role) {
        return (
            <div>
                <Title level={3}>Rol no encontrado</Title>
                <Link to="/roles">
                    <Button type="primary">Volver a la lista</Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Title level={2}>Detalle del Rol</Title>
                <div>
                    <Link to="/roles">
                        <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 8 }}>
                            Volver
                        </Button>
                    </Link>
                    <Link to={`/roles/edit/${id}`}>
                        <Button type="primary" icon={<EditOutlined />}>
                            Editar
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">{role.id}</Descriptions.Item>
                    <Descriptions.Item label="Nombre">{role.nombre}</Descriptions.Item>
                    <Descriptions.Item label="Descripción">{role.descripcion}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default RoleView;