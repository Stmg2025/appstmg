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
    const [imagePath, setImagePath] = useState(null); // Para guardar la ruta relativa
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

                        // Guardar la ruta relativa de la imagen
                        if (itemData.imagen) {
                            setImagePath(itemData.imagen);
                            setImageUrl(itemData.imagen.startsWith('http')
                                ? itemData.imagen
                                : `${process.env.REACT_APP_BACKEND_URL || 'https://stmg.cl'}${itemData.imagen}`);
                        }

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
                // Si hay un nuevo archivo seleccionado, enviarlo
                formData.append("imagen", file);
            } else if (imagePath) {
                // Si hay una imagen existente y no se seleccionó un nuevo archivo,
                // enviar la ruta relativa de la imagen existente
                formData.append("imagen", imagePath);
            }

            console.log("🚀 Enviando actualización del repuesto:", Object.fromEntries(formData));

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
                    <Image
                        width={250}
                        src={imageUrl}
                        alt="Imagen del repuesto"
                        style={{ marginBottom: 20 }}
                        fallback="data:image/png;base64,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"
                    />
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
                        {!file && imageUrl && (
                            <p style={{ marginTop: 8 }}>Imagen actual: {imagePath}</p>
                        )}
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