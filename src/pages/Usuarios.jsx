import { useEffect, useState } from 'react';
import { Table, Space, Button, message, Tag, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import UsuarioModal from '../components/UsuarioModal';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://stmg.cl/node-server/api/usuarios', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (response.ok) {
                setUsuarios(data.users);
            } else {
                message.error(data.message || 'Error al obtener usuarios');
            }
        } catch (error) {
            message.error('Error en la conexión con el servidor');
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value.toLowerCase());
    };

    const filteredUsuarios = usuarios.filter(user =>
        user.nombre.toLowerCase().includes(searchText) ||
        user.apellido.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.cargo.toLowerCase().includes(searchText)
    );

    const columns = [
        { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
        { title: 'Apellido', dataIndex: 'apellido', key: 'apellido' },
        { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'RUT', dataIndex: 'rut', key: 'rut' },
        { title: 'Cargo', dataIndex: 'cargo', key: 'cargo' },
        {
            title: 'Estado', dataIndex: 'estado', key: 'estado',
            render: (estado) => (
                <Tag color={estado === 'activo' ? 'green' : estado === 'suspendido' ? 'red' : 'orange'}>
                    {estado?.toUpperCase() || 'N/A'}
                </Tag>
            )
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <Space>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Editar</Button>
                    <Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>Eliminar</Button>
                </Space>
            )
        }
    ];

    const handleEdit = (user) => {
        // Crear una copia del usuario para editar, sin enviar la contraseña
        const userToEdit = { ...user };
        delete userToEdit.password_hash; // Asegurarnos de no enviar el hash

        setEditingUser(userToEdit);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://stmg.cl/node-server/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                message.success('Usuario eliminado correctamente');
                fetchUsuarios();
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Error al eliminar usuario');
            }
        } catch (error) {
            message.error('Error en la conexión con el servidor');
        }
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        setModalVisible(false);
    };

    return (
        <div style={{ padding: '20px', background: '#2C2C2C', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)' }}>
            <h1 style={{ color: '#FFFFFF' }}>Gestión de Usuarios</h1>

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Input prefix={<SearchOutlined />} placeholder="Buscar usuario..." style={{ width: '300px' }} onChange={handleSearch} />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ background: '#FF0000', borderColor: '#FF0000' }}
                    onClick={() => {
                        setEditingUser(null); // Asegurarse de que no estamos editando
                        setModalVisible(true);
                    }}
                >
                    Agregar Usuario
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredUsuarios}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 8 }}
                locale={{
                    emptyText: 'No hay usuarios para mostrar'
                }}
            />

            {/* Modal separado en un componente */}
            <UsuarioModal
                visible={modalVisible}
                onClose={handleCloseModal}
                onSuccess={fetchUsuarios}
                editingUser={editingUser}
            />
        </div>
    );
};

export default Usuarios;