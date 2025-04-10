import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Popconfirm, Typography, Input } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';

const { Title } = Typography;

const InventoryList = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredInventory, setFilteredInventory] = useState([]);

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
        filterInventory();
    }, [searchText, inventory]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await inventoryService.getInventory();

            if (response.data.success) {
                setInventory(response.data.inventory);
                setFilteredInventory(response.data.inventory);
            } else {
                message.error('Error al cargar el inventario');
            }
        } catch (error) {
            console.error('Error al obtener inventario:', error);
            message.error('Error al cargar el inventario');
        } finally {
            setLoading(false);
        }
    };

    const filterInventory = () => {
        if (!searchText) {
            setFilteredInventory(inventory);
            return;
        }

        const filtered = inventory.filter(item =>
            (item.codigo || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (item.descripcion || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (item.ubicacion || '').toLowerCase().includes(searchText.toLowerCase())
        );

        setFilteredInventory(filtered);
    };

    const handleDelete = async (id) => {
        try {
            const response = await inventoryService.deleteInventoryItem(id);

            if (response.data.success) {
                message.success('Item eliminado correctamente');
                fetchInventory(); // Recargar la lista
            } else {
                message.error('Error al eliminar el item');
            }
        } catch (error) {
            console.error('Error al eliminar item:', error);
            message.error('Error al eliminar el item');
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
            title: 'Código',
            dataIndex: 'codigo',
            key: 'codigo',
            sorter: (a, b) => a.codigo.localeCompare(b.codigo),
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
            sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
        },
        {
            title: 'Ubicación',
            dataIndex: 'ubicacion',
            key: 'ubicacion',
            sorter: (a, b) => a.ubicacion.localeCompare(b.ubicacion),
        },
        {
            title: 'Valor',
            dataIndex: 'valor',
            key: 'valor',
            render: (valor) => `$${valor.toLocaleString()}`,
            sorter: (a, b) => a.valor - b.valor,
        },
        {
            title: 'Costo',
            dataIndex: 'costo',
            key: 'costo',
            render: (costo) => `$${costo.toLocaleString()}`,
            sorter: (a, b) => a.costo - b.costo,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            sorter: (a, b) => a.stock - b.stock,
        },
        {
            title: 'Acciones',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/inventory/${record.id}`}>
                        <Button type="primary" icon={<EyeOutlined />} size="small">
                            Ver
                        </Button>
                    </Link>
                    <Link to={`/inventory/edit/${record.id}`}>
                        <Button type="default" icon={<EditOutlined />} size="small">
                            Editar
                        </Button>
                    </Link>
                    <Popconfirm
                        title="¿Estás seguro de eliminar este item?"
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
                <Title level={2}>Inventario</Title>
                <Link to="/inventory/create">
                    <Button type="primary" icon={<PlusOutlined />}>
                        Agregar Item
                    </Button>
                </Link>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Buscar por código, descripción o ubicación"
                    prefix={<SearchOutlined />}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredInventory}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default InventoryList;
