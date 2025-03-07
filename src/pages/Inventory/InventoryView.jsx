import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Typography, Tag, Image } from 'antd';
import { EditOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import inventoryService from '../../services/inventoryService';

const { Title } = Typography;

const InventoryView = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItemData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log(`🔍 Obteniendo datos del inventario para el ID: ${id}`);
                const response = await inventoryService.getInventoryItemById(id);

                console.log("✅ Respuesta del servidor:", response.data);

                if (response.data && response.data.success) {
                    const itemData = response.data.repuesto;

                    if (itemData && itemData.id) {
                        setItem(itemData);
                    } else {
                        throw new Error("El backend no devolvió datos válidos.");
                    }
                } else {
                    throw new Error(response.data.message || "No se encontraron datos.");
                }
            } catch (error) {
                console.error('❌ Error al obtener item:', error);
                setError(error.message);
                message.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchItemData();
    }, [id]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (error || !item) {
        return (
            <div>
                <Title level={3}>Item no encontrado</Title>
                <p style={{ color: 'red' }}>{error || "No se encontró información del item en el servidor."}</p>
                <Link to="/inventory">
                    <Button type="primary">Volver al inventario</Button>
                </Link>
            </div>
        );
    }

    const margin = item.valor - item.costo;
    const marginPercentage = ((margin / item.costo) * 100).toFixed(2);

    const getStockStatus = (stock) => {
        if (stock <= 0) {
            return <Tag color="red">Sin Stock</Tag>;
        } else if (stock < 5) {
            return <Tag color="orange" icon={<WarningOutlined />}>Stock Bajo</Tag>;
        } else {
            return <Tag color="green">Disponible</Tag>;
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Title level={2}>Detalle del Item</Title>
                <div>
                    <Link to="/inventory">
                        <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 8 }}>
                            Volver
                        </Button>
                    </Link>
                    <Link to={`/inventory/edit/${id}`}>
                        <Button type="primary" icon={<EditOutlined />}>
                            Editar
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                {item.imagen ? (
                    <Image
                        width={250}
                        src={`${process.env.REACT_APP_BACKEND_URL}${item.imagen}`}
                        alt="Imagen del repuesto"
                        style={{ marginBottom: 20 }}
                    />
                ) : (
                    <p style={{ color: 'gray' }}>📷 No hay imagen disponible</p>
                )}

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">{item.id}</Descriptions.Item>
                    <Descriptions.Item label="Código">{item.codigo}</Descriptions.Item>
                    <Descriptions.Item label="Descripción">{item.descripcion}</Descriptions.Item>
                    <Descriptions.Item label="Ubicación">{item.ubicacion}</Descriptions.Item>
                    <Descriptions.Item label="Valor (Precio de Venta)">${item.valor?.toLocaleString() || 0}</Descriptions.Item>
                    <Descriptions.Item label="Costo (Precio de Compra)">${item.costo?.toLocaleString() || 0}</Descriptions.Item>
                    <Descriptions.Item label="Margen">${margin?.toLocaleString() || 0} ({marginPercentage}%)</Descriptions.Item>
                    <Descriptions.Item label="Stock">
                        {item.stock} {getStockStatus(item.stock)}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default InventoryView;
