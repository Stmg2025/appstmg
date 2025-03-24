import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import roleService from '../../services/roleService';

const { Title } = Typography;

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState({});
    const [loadingRoles, setLoadingRoles] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoadingRoles(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error("No hay token disponible. Inicia sesión nuevamente.");
            }

            const response = await roleService.getRoles({
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                // Crear un objeto con id como clave y nombre como valor
                const rolesMap = {};
                response.data.roles.forEach(role => {
                    rolesMap[role.id] = role.nombre;
                });
                setRoles(rolesMap);
            } else {
                throw new Error(response.data.message || "No se pudieron obtener los roles.");
            }
        } catch (error) {
            console.error('Error al obtener roles:', error);
            message.error("Error al cargar los roles");
        } finally {
            setLoadingRoles(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token'); // Obtener token

            if (!token) {
                throw new Error("No hay token disponible. Inicia sesión nuevamente.");
            }

            const response = await userService.getUsers({
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("✅ Usuarios obtenidos:", response.data);

            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                throw new Error(response.data.message || "No se pudieron obtener los usuarios.");
            }
        } catch (error) {
            console.error('❌ Error al obtener usuarios:', error);
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error("No hay token disponible. Inicia sesión nuevamente.");
            }

            const response = await userService.deleteUser(id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("🗑 Usuario eliminado:", response.data);

            if (response.data.success) {
                message.success('Usuario eliminado correctamente');
                fetchUsers(); // Recargar la lista
            } else {
                throw new Error(response.data.message || "No se pudo eliminar el usuario.");
            }
        } catch (error) {
            console.error('❌ Error al eliminar usuario:', error);
            message.error(error.message);
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
            key: 'nombre',
            render: (text, record) => `${record.first_name} ${record.last_name}`,
            sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'RUT',
            dataIndex: 'rut',
            key: 'rut',
        },
        {
            title: 'Cargo',
            dataIndex: 'cargo',
            key: 'cargo',
            sorter: (a, b) => a.cargo.localeCompare(b.cargo),
        },
        {
            title: 'Rol',
            dataIndex: 'role_id',
            key: 'role_id',
            render: (role_id) => roles[role_id] || `ID: ${role_id}`,
            sorter: (a, b) => {
                const roleNameA = roles[a.role_id] || '';
                const roleNameB = roles[b.role_id] || '';
                return roleNameA.localeCompare(roleNameB);
            },
        },
        {
            title: 'Estado',
            key: 'estado',
            render: (_, record) => (
                <span style={{ color: record.is_active ? 'green' : 'red' }}>
                    {record.is_active ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            title: 'Acciones',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/users/${record.id}`}>
                        <Button type="primary" icon={<EyeOutlined />} size="small">
                            Ver
                        </Button>
                    </Link>
                    <Link to={`/users/edit/${record.id}`}>
                        <Button type="default" icon={<EditOutlined />} size="small">
                            Editar
                        </Button>
                    </Link>
                    <Popconfirm
                        title="¿Estás seguro de eliminar este usuario?"
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
                <Title level={2}>Lista de Usuarios</Title>
                <Link to="/users/create">
                    <Button type="primary" icon={<PlusOutlined />}>
                        Crear Usuario
                    </Button>
                </Link>
            </div>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading || loadingRoles}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default UserList;