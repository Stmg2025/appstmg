import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import estadoSolicitudService from '../../services/estadoSolicitudService';

const { Title } = Typography;

const EstadoSolicitudView = () => {
    const { id } = useParams();
    const [estado, setEstado] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEstado = async () => {
            try {
                setLoading(true);
                const response = await estadoSolicitudService.getEstadoById(id);

                if (response.data.success) {
                    setEstado(response.data.estado);
                } else {
                    message.error('Error al cargar los datos del estado');
                }
            } catch (error) {
                console.error('Error al obtener estado:', error);
                message.error('Error al cargar los datos del estado');
            } finally {
                setLoading(false);
            }
        };

        fetchEstado();
    }, [id]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!estado) {
        return (
            <div>
                <Title level={3}>Estado no encontrado</Title>
                <Link to="/estados-solicitud">
                    <Button type="primary">Volver a la lista</Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Title level={2}>Detalle del Estado</Title>
                <div>
                    <Link to="/estados-solicitud">
                        <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 8 }}>
                            Volver
                        </Button>
                    </Link>
                    <Link to={`/estados-solicitud/edit/${id}`}>
                        <Button type="primary" icon={<EditOutlined />}>
                            Editar
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">{estado.id}</Descriptions.Item>
                    <Descriptions.Item label="Nombre">{estado.nombre}</Descriptions.Item>
                    <Descriptions.Item label="Descripción">{estado.descripcion}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default EstadoSolicitudView;
