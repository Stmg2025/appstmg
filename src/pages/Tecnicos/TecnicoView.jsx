import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import tecnicoService from '../../services/tecnicoService';

const { Title } = Typography;

const TecnicoView = () => {
    const { id } = useParams();
    const [tecnico, setTecnico] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTecnicoData = async () => {
            try {
                setLoading(true);
                const response = await tecnicoService.getTecnicoById(id);

                if (response.data.success) {
                    setTecnico(response.data.tecnico);
                } else {
                    message.error('Error al cargar los datos del técnico');
                }
            } catch (error) {
                console.error('Error al obtener técnico:', error);
                message.error('Error al cargar los datos del técnico');
            } finally {
                setLoading(false);
            }
        };

        fetchTecnicoData();
    }, [id]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!tecnico) {
        return (
            <div>
                <Title level={3}>Técnico no encontrado</Title>
                <Link to="/tecnicos">
                    <Button type="primary">Volver a la lista</Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Title level={2}>Detalle del Técnico</Title>
                <div>
                    <Link to="/tecnicos">
                        <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 8 }}>
                            Volver
                        </Button>
                    </Link>
                    <Link to={`/tecnicos/edit/${id}`}>
                        <Button type="primary" icon={<EditOutlined />}>
                            Editar
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">{tecnico.id}</Descriptions.Item>
                    <Descriptions.Item label="Nombre Completo">{tecnico.nombre_completo}</Descriptions.Item>
                    <Descriptions.Item label="Email">{tecnico.email}</Descriptions.Item>
                    <Descriptions.Item label="RUT">{tecnico.rut}</Descriptions.Item>
                    <Descriptions.Item label="Teléfono">{tecnico.telefono}</Descriptions.Item>
                    <Descriptions.Item label="Tipo de Técnico">{tecnico.tipo_tecnico || 'No especificado'}</Descriptions.Item>
                    <Descriptions.Item label="Especialidad">{tecnico.especialidad || 'No especificada'}</Descriptions.Item>

                </Descriptions>
            </Card>
        </div>
    );
};

export default TecnicoView;