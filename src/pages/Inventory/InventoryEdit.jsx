import React, { useState, useEffect } from 'react';
import { Form, Input, Button, InputNumber, Typography, message, Spin, Card, Upload, Image } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import inventoryService from '../../services/inventoryService';

const { Title } = Typography;

const InventoryEdit = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(null);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItemData = async () => {
            try {
                setInitialLoading(true);
                console.log(`🔍 Obteniendo datos del repuesto con ID: ${id}`);

                const response = await inventoryService.getInventoryItemById(id);
                console.log("✅ Respuesta del backend:", response.data);

                if (response.data && response.data.success) {
                    const itemData = response.data.repuesto;

                    if (itemData && itemData.id) {
                        const formData = {
                            codigo: itemData.codigo || '',
                            descripcion: itemData.descripcion || '',
                            ubicacion: itemData.ubicacion || '',
                            valor: parseFloat(itemData.valor) || 0,
                            costo: parseFloat(itemData.costo) || 0,
                            stock: parseInt(itemData.stock, 10) || 0
                        };

                        form.setFieldsValue(formData);
                        setImageUrl(itemData.imagen ? `${process.env.REACT_APP_BACKEND_URL}${itemData.imagen}` : null);
                        message.success('Datos cargados correctamente');
                    } else {
                        throw new Error("El backend no devolvió datos válidos.");
                    }
                } else {
                    throw new Error(response.data.message || "No se encontraron datos.");
                }
            } catch (error) {
                console.error('❌ Error al cargar datos:', error);
                message.error("Error al obtener los datos del repuesto.");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchItemData();
    }, [id, form]);

    const handleFileChange = ({ file }) => {
        setFile(file.originFileObj);
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("codigo", values.codigo);
            formData.append("descripcion", values.descripcion);
            formData.append("ubicacion", values.ubicacion);
            formData.append("valor", values.valor);
            formData.append("costo", values.costo);
            formData.append("stock", values.stock);

            if (file) {
                formData.append("imagen", file);
            } else if (imageUrl) {
                formData.append("imagen", imageUrl);
            }

            console.log("🚀 Enviando actualización del repuesto:", formData);

            const response = await inventoryService.updateInventoryItem(id, formData);

            console.log("✅ Respuesta del backend:", response.data);

            if (response.data && response.data.success) {
                message.success('Ítem actualizado exitosamente');
                navigate(`/inventory/${id}`);
            } else {
                throw new Error(response.data.message || "Error al actualizar el ítem.");
            }
        } catch (error) {
            console.error('❌ Error al actualizar ítem:', error);
            message.error('Error al actualizar el ítem.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2}>Editar Ítem de Inventario</Title>

            <Card style={{ marginBottom: 16 }}>
                {imageUrl ? (
                    <Image width={250} src={imageUrl} alt="Imagen del repuesto" style={{ marginBottom: 20 }} />
                ) : (
                    <p style={{ color: 'gray' }}>📷 No hay imagen disponible</p>
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
                    encType="multipart/form-data"
                >
                    <Form.Item
                        name="codigo"
                        label="Código"
                        rules={[{ required: true, message: 'Por favor ingresa el código del ítem' }]}
                    >
                        <Input placeholder="Ej: RP001" />
                    </Form.Item>

                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
                    >
                        <Input.TextArea placeholder="Descripción detallada del ítem" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="ubicacion"
                        label="Ubicación"
                        rules={[{ required: true, message: 'Por favor ingresa la ubicación del ítem' }]}
                    >
                        <Input placeholder="Ej: Bodega 1, Estante A-12" />
                    </Form.Item>

                    <Form.Item
                        name="valor"
                        label="Valor (Precio de Venta)"
                        rules={[{ required: true, message: 'Por favor ingresa el valor del ítem' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="Valor en pesos" />
                    </Form.Item>

                    <Form.Item
                        name="costo"
                        label="Costo (Precio de Compra)"
                        rules={[{ required: true, message: 'Por favor ingresa el costo del ítem' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="Costo en pesos" />
                    </Form.Item>

                    <Form.Item
                        name="stock"
                        label="Stock"
                        rules={[{ required: true, message: 'Por favor ingresa el stock' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="Cantidad disponible" />
                    </Form.Item>

                    <Form.Item label="Imagen del Repuesto">
                        <Upload
                            beforeUpload={() => false}
                            onChange={handleFileChange}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />}>Seleccionar Imagen</Button>
                        </Upload>
                        {file && <p>{file.name}</p>}
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Actualizar Ítem
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={() => navigate(`/inventory/${id}`)}>
                            Cancelar
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default InventoryEdit;
