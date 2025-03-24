import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Typography, message, Card, Upload, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import inventoryService from '../../services/inventoryService';

const { Title, Text } = Typography;

const InventoryCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (info) => {
        // info.file.originFileObj contiene el archivo original
        if (info.file && info.file.originFileObj) {
            // Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (info.file.originFileObj.size > maxSize) {
                message.error('La imagen es demasiado grande. Máximo 5MB permitido.');
                return;
            }

            // Validar tipo de archivo
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(info.file.originFileObj.type)) {
                message.error('Formato de imagen no válido. Use JPG, PNG, GIF o WEBP.');
                return;
            }

            setFile(info.file.originFileObj);

            // Mostrar vista previa
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(info.file.originFileObj);

            // Mostrar mensaje de éxito
            message.success(`${info.file.name} seleccionado correctamente`);
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);

            // Si hay un archivo, lo subimos primero
            let fileUrl = null;
            if (file) {
                setUploadLoading(true);
                message.loading('Subiendo imagen...', 0);

                try {
                    const uploadResponse = await inventoryService.uploadFile(file);
                    console.log("Respuesta de subida de imagen:", uploadResponse);

                    if (uploadResponse.data && uploadResponse.data.success) {
                        fileUrl = uploadResponse.data.fileUrl;
                        message.destroy(); // Eliminar mensaje de carga
                        message.success('Imagen subida correctamente');
                    } else {
                        throw new Error('Error al subir la imagen');
                    }
                } catch (error) {
                    message.destroy(); // Eliminar mensaje de carga
                    message.error('Error al subir la imagen: ' + (error.message || 'Error desconocido'));
                    setLoading(false);
                    setUploadLoading(false);
                    return; // Detener si falla la subida de imagen
                } finally {
                    setUploadLoading(false);
                }
            }

            // Preparar datos para crear el item
            const itemData = {
                codigo: values.codigo,
                descripcion: values.descripcion,
                ubicacion: values.ubicacion || '',
                valor: values.valor || 0,
                costo: values.costo || 0,
                stock: values.stock || 0,
                tipo_repuesto: values.tipo_repuesto || '',
                equipo_asociado: values.equipo_asociado || '',
                origen: values.origen || ''
            };

            // Agregar URL de imagen si existe
            if (fileUrl) {
                itemData.imagen = fileUrl;
            }

            console.log("Datos a enviar para creación:", itemData);

            const response = await inventoryService.createInventoryItem(itemData);

            if (response.data && response.data.success) {
                message.success('Ítem creado exitosamente');
                navigate('/inventory');
            } else {
                throw new Error(response.data?.message || "Error al crear el ítem.");
            }
        } catch (error) {
            console.error('❌ Error al crear ítem:', error);
            message.error(error.message || 'Error al crear el ítem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2}>Crear Nuevo Ítem de Inventario</Title>

            <Card style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
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
                    >
                        <Input placeholder="Ej: Bodega 1, Estante A-12" />
                    </Form.Item>

                    <Form.Item
                        name="valor"
                        label="Valor (Precio de Venta)"
                        rules={[{ required: true, message: 'Por favor ingresa el valor del ítem' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={0}
                            placeholder="Valor en pesos"
                        />
                    </Form.Item>

                    <Form.Item
                        name="costo"
                        label="Costo (Precio de Compra)"
                        rules={[{ required: true, message: 'Por favor ingresa el costo del ítem' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={0}
                            placeholder="Costo en pesos"
                        />
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
                            name="archivo" // Nombre cambiado para consistencia con el backend
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            maxCount={1}
                            disabled={uploadLoading}
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Nueva imagen"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div>
                                    {uploadLoading ? <LoadingOutlined /> : <UploadOutlined />}
                                    <div style={{ marginTop: 8 }}>
                                        {uploadLoading ? 'Subiendo...' : 'Seleccionar imagen'}
                                    </div>
                                </div>
                            )}
                        </Upload>

                        {file && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="success">Imagen seleccionada: {file.name}</Text>
                                <br />
                                <Text type="secondary">({(file.size / 1024).toFixed(2)} KB)</Text>
                            </div>
                        )}

                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                            Formatos permitidos: JPG, PNG, GIF, WEBP. Tamaño máximo: 5MB.
                        </Text>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading || uploadLoading}
                            disabled={uploadLoading}
                        >
                            Crear Ítem
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => navigate('/inventory')}
                            disabled={loading || uploadLoading}
                        >
                            Cancelar
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default InventoryCreate;