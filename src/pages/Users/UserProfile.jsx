import React, { useState, useEffect } from 'react';
import { Card, Form, Input, DatePicker, Button, message, Spin, Row, Col, Divider, Avatar, Upload } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, IdcardOutlined, CalendarOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import api from '../../config/api';

const UserProfile = () => {
    const [form] = Form.useForm();
    const { user, updateUserInfo } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user || !user.id) return;

            setLoading(true);
            try {
                const response = await api.get(`/users/${user.id}`);
                const userData = response.data.data || response.data;

                form.setFieldsValue({
                    ...userData,
                    fecha_nacimiento: userData.fecha_nacimiento ? dayjs(userData.fecha_nacimiento) : null
                });

                // Si el usuario tiene foto de perfil, mostrarla
                if (userData.foto_perfil) {
                    setImageUrl(`${process.env.REACT_APP_API_URL || ''}/uploads/${userData.foto_perfil}`);
                }
            } catch (error) {
                console.error('Error al cargar los datos del usuario:', error);
                message.error('No se pudieron cargar los datos del usuario');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, form]);

    const handleSubmit = async (values) => {
        if (!user || !user.id) return;

        setSubmitting(true);
        try {
            // Formatear la fecha de nacimiento
            const formattedValues = {
                ...values,
                fecha_nacimiento: values.fecha_nacimiento ? values.fecha_nacimiento.format('YYYY-MM-DD') : null
            };

            // Eliminar el password si está vacío
            if (!formattedValues.password) {
                delete formattedValues.password;
            }

            const response = await api.put(`/users/${user.id}`, formattedValues);

            if (response.data.success) {
                message.success('Perfil actualizado correctamente');
                // Actualizar la información del usuario en el contexto de autenticación
                updateUserInfo(response.data.data || response.data);
            }
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            message.error('No se pudo actualizar el perfil');
        } finally {
            setSubmitting(false);
        }
    };

    // Función para subir la imagen de perfil
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Solo puedes subir archivos de imagen!');
            return false;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('La imagen debe ser menor a 2MB!');
            return false;
        }

        return true;
    };

    const handleUpload = async (options) => {
        const { file, onSuccess, onError } = options;

        const formData = new FormData();
        formData.append('archivo', file);

        setUploadLoading(true);

        try {
            const response = await api.post('/uploads/profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                // Obtener el nombre del archivo
                const filename = response.data.filename;
                setImageUrl(`${process.env.REACT_APP_API_URL || ''}/uploads/${filename}`);

                // Actualizar el campo foto_perfil en el usuario
                await api.put(`/users/${user.id}`, { foto_perfil: filename });

                // Actualizar el contexto de autenticación
                updateUserInfo({ ...user, foto_perfil: filename });

                message.success('Imagen de perfil actualizada correctamente');
                onSuccess(null, file);
            } else {
                message.error('Error al subir la imagen');
                onError();
            }
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            message.error('Error al subir la imagen');
            onError();
        } finally {
            setUploadLoading(false);
        }
    };

    // Configuración del componente Upload
    const uploadButton = (
        <div>
            {uploadLoading ? <LoadingOutlined /> : <UploadOutlined />}
            <div style={{ marginTop: 8 }}>Subir Foto</div>
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spin size="large" tip="Cargando datos del usuario..." />
            </div>
        );
    }

    return (
        <div className="user-profile-container">
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Mi Perfil</h2>
                            <p style={{ margin: 0, color: '#888' }}>{user?.email}</p>
                        </div>
                    </div>
                }
                style={{ maxWidth: 800, margin: '0 auto' }}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Upload
                        name="photo"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        customRequest={handleUpload}
                        beforeUpload={beforeUpload}
                    >
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png";
                                }}
                            />
                        ) : (
                            uploadButton
                        )}
                    </Upload>
                    <p className="ant-upload-hint">
                        Haz clic para cambiar tu foto de perfil
                    </p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        ...user,
                        fecha_nacimiento: user?.fecha_nacimiento ? dayjs(user.fecha_nacimiento) : null
                    }}
                >
                    <Divider orientation="left">Información Personal</Divider>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="first_name"
                                label="Nombre"
                                rules={[{ required: true, message: 'Por favor ingrese su nombre' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Nombre" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="last_name"
                                label="Apellido"
                                rules={[{ required: true, message: 'Por favor ingrese su apellido' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Apellido" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="rut"
                                label="RUT"
                                rules={[{ required: true, message: 'Por favor ingrese su RUT' }]}
                            >
                                <Input prefix={<IdcardOutlined />} placeholder="12.345.678-9" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="fecha_nacimiento"
                                label="Fecha de Nacimiento"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Seleccione fecha"
                                    suffixIcon={<CalendarOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="cargo"
                                label="Cargo"
                            >
                                <Input prefix={<UserOutlined />} placeholder="Cargo o posición" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="phone_number"
                                label="Teléfono"
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="+56 9 XXXX XXXX" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Información de Cuenta</Divider>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Por favor ingrese su email' },
                                    { type: 'email', message: 'Por favor ingrese un email válido' }
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="password"
                                label="Nueva Contraseña"
                                rules={[
                                    {
                                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
                                        warningOnly: true
                                    }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Dejar en blanco para mantener la actual"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} justify="end" style={{ marginTop: 24 }}>
                        <Col>
                            <Button onClick={() => navigate('/dashboard')} style={{ marginRight: 8 }}>
                                Cancelar
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Guardar Cambios
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default UserProfile;