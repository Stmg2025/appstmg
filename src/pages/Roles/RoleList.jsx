import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import roleService from '../../services/roleService';

const { Title } = Typography;

const RoleList = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await roleService.getRoles();

            if (response.data.success) {
                setRoles(response.data.roles);
            } else {
                message.error('Error al cargar los roles');
            }
        } catch (error) {
            console.error('Error al obtener roles:', error);
            message.error('Error al cargar los roles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await roleService.deleteRole(id);

            if (response.data.success) {
                message.success('Rol eliminado correctamente');
                fetchRoles(); // Recargar la lista
            } else {
                message.error('Error al eliminar el rol');
            }
        } catch (error) {
            console.error('Error al eliminar rol:', error);
            message.error('Error al eliminar el rol');
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
                    <Link to={`/roles/${record.id}`}>
                        <Button type="primary" icon={<EyeOutlined />} size="small">
                            Ver
                        </Button>
                    </Link>
                    <Link to={`/roles/edit/${record.id}`}>
                        <Button type="default" icon={<EditOutlined />} size="small">
                            Editar
                        </Button>
                    </Link>
                    <Popconfirm
                        title="¿Estás seguro de eliminar este rol?"
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
                <Title level={2}>Lista de Roles</Title>
                <Link to="/roles/create">
                    <Button type="primary" icon={<PlusOutlined />}>
                        Crear Rol
                    </Button>
                </Link>
            </div>
            <Table
                columns={columns}
                dataSource={roles}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default RoleList;