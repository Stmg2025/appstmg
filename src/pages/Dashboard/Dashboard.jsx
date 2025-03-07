import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Spin, message } from 'antd';
import { DollarOutlined, DatabaseOutlined, WarningOutlined } from '@ant-design/icons';
import inventoryService from '../../services/inventoryService';

const { Title } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [mostExpensiveItem, setMostExpensiveItem] = useState(null);
    const [cheapestItem, setCheapestItem] = useState(null);

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const fetchInventoryData = async () => {
        try {
            setLoading(true);
            const response = await inventoryService.getInventory();

            if (response.data.success) {
                const items = response.data.inventory;
                setInventory(items);
                setTotalItems(items.length);

                // Filtrar repuestos con stock bajo (menos de 5 unidades)
                const lowStock = items.filter(item => item.stock < 5);
                setLowStockItems(lowStock);

                // Encontrar el repuesto más costoso y más barato
                const expensive = items.reduce((max, item) => (item.valor > max.valor ? item : max), items[0]);
                const cheap = items.reduce((min, item) => (item.valor < min.valor ? item : min), items[0]);

                setMostExpensiveItem(expensive);
                setCheapestItem(cheap);
            } else {
                throw new Error("No se pudo obtener la información del inventario.");
            }
        } catch (error) {
            console.error("❌ Error al obtener datos del inventario:", error);
            message.error("No se pudo cargar la información del inventario.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2}>Dashboard de Inventario</Title>

            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total de Repuestos"
                            value={totalItems}
                            prefix={<DatabaseOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Repuesto Más Costoso"
                            value={mostExpensiveItem ? mostExpensiveItem.codigo : 'N/A'}
                            prefix={<DollarOutlined />}
                        />
                        <p>{mostExpensiveItem?.descripcion} - ${mostExpensiveItem?.valor?.toLocaleString()}</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Repuesto Más Económico"
                            value={cheapestItem ? cheapestItem.codigo : 'N/A'}
                            prefix={<DollarOutlined />}
                        />
                        <p>{cheapestItem?.descripcion} - ${cheapestItem?.valor?.toLocaleString()}</p>
                    </Card>
                </Col>
            </Row>

            <Card title="📉 Repuestos con Stock Bajo" style={{ marginTop: 20 }}>
                <Table
                    dataSource={lowStockItems}
                    columns={[
                        { title: "Código", dataIndex: "codigo", key: "codigo" },
                        { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
                        { title: "Stock", dataIndex: "stock", key: "stock", render: stock => <span style={{ color: "red" }}>{stock}</span> }
                    ]}
                    rowKey="id"
                    pagination={false}
                />
            </Card>
        </div>
    );
};

export default Dashboard;
