import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import estadoSolicitudService from '../../services/estadoSolicitudService';

const { Title } = Typography;

const EstadoSolicitudList = () => {
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEstados();
    }, []);

    const fetchEstados = async () => {
        try {
            setLoading(true);
            const response = await estadoSolicitudService.getEstados();

            if (response.data.success) {
                setEstados(response.data.estados);
            } else {
                message.error('Error al cargar los estados');
            }
        } catch (error) {
            console.error('Error al obtener estados:', error);
            message.error('Error al cargar los estados');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await estadoSolicitudService.deleteEstado(id);

            if (response.data.success) {
                message.success('Estado eliminado correctamente');
                fetchEstados(); // Recargar la lista
            } else {
                message.error('Error al eliminar el estado');
            }
        } catch (error) {
            console.error('Error al eliminar estado:', error);
            message.error('Error al eliminar el estado');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: (a, b) => a.nombre.localeCompare(b.nombre),
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
        },
        {
            title: 'Acciones',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/estados-solicitud/${record.id}`}>
                        <Button type="primary" icon={<EyeOutlined />} size="small">
                            Ver
                        </Button>
                    </Link>
                    <Link to={`/estados-solicitud/edit/${record.id}`}>
                        <Button type="default" icon={<EditOutlined />} size="small">
                            Editar
                        </Button>
                    </Link>
                    <Popconfirm
                        title="¿Estás seguro de eliminar este estado?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button type="danger" icon={<DeleteOutlined />} size="small">
                            Eliminar
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Estados de Solicitud</Title>
                <Link to="/estados-solicitud/create">
                    <Button type="primary" icon={<PlusOutlined />}>
                        Crear Estado
                    </Button>
                </Link>
            </div>
            <Table
                columns={columns}
                dataSource={estados}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default EstadoSolicitudList;
