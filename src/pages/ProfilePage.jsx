// src/pages/ProfilePage.jsx
import { useState, useEffect, useContext } from 'react';
import { Card, Form, Input, Button, Avatar, Row, Col, Tabs, DatePicker, message } from 'antd';
import { UserOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import dayjs from 'dayjs';
import axios from 'axios';

const { TabPane } = Tabs;

const ProfilePage = () => {
    const { user, login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        if (user && user.user) {
            form.setFieldsValue({
                nombre: user.user.nombre,
                apellido: user.user.apellido,
                email: user.user.email,
                telefono: user.user.telefono,
                rut: user.user.rut,
                cargo: user.user.cargo,
                fecha_nacimiento: user.user.fecha_nacimiento ? dayjs(user.user.fecha_nacimiento) : null,
            });

            // Si el usuario tiene una foto, establecer la URL completa
            if (user.user.fotografia) {
                setProfileImage(user.user.fotografia);
            }
        }
    }, [user, form]);

    const handleImageUploaded = async (imageUrl) => {
        try {
            const token = localStorage.getItem('token');
            const userId = user.user.id;

            const response = await axios.put(
                `https://stmg.cl/node-server/api/usuarios/${userId}`,
                { fotografia: imageUrl },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.user) {
                // Actualizar estado local con la nueva imagen
                setProfileImage(imageUrl);

                // Actualizar el contexto de autenticación
                const updatedUser = {
                    ...user,
                    user: {
                        ...user.user,
                        fotografia: imageUrl
                    }
                };

                localStorage.setItem('user', JSON.stringify(updatedUser));
                login(updatedUser);

                message.success('Foto de perfil actualizada correctamente');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al actualizar la foto de perfil');
        }
    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userId = user.user.id;

            // Formatear los datos para enviar al servidor
            const userData = {
                ...values,
                fecha_nacimiento: values.fecha_nacimiento ? values.fecha_nacimiento.format('YYYY-MM-DD') : null
            };

            const response = await axios.put(
                `https://stmg.cl/node-server/api/usuarios/${userId}`,
                userData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.user) {
                message.success('Perfil actualizado correctamente');

                // Actualizar el contexto y localStorage con los datos actualizados
                const updatedUser = {
                    ...user,
                    user: {
                        ...user.user,
                        ...userData
                    }
                };

                localStorage.setItem('user', JSON.stringify(updatedUser));
                login(updatedUser);
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userId = user.user.id;

            const response = await axios.put(
                `https://stmg.cl/node-server/api/usuarios/${userId}`,
                { password: values.newPassword },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                message.success('Contraseña actualizada correctamente');
                passwordForm.resetFields();
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '20px' }}>Mi Perfil</h1>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Avatar
                                size={120}
                                src={profileImage ? `https://stmg.cl/node-server${profileImage}` : null}
                                icon={!profileImage ? <UserOutlined /> : null}
                                style={{ marginBottom: '20px' }}
                            />
                            <h2>{user?.user?.nombre} {user?.user?.apellido}</h2>
                            <p>{user?.user?.cargo}</p>

                            <ProfilePhotoUpload onSuccess={handleImageUploaded} />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    <Card>
                        <Tabs defaultActiveKey="profile">
                            <TabPane tab="Información Personal" key="profile">
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleUpdateProfile}
                                >
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="nombre"
                                                label="Nombre"
                                                rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="apellido"
                                                label="Apellido"
                                                rules={[{ required: true, message: 'Por favor ingresa tu apellido' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="email"
                                                label="Email"
                                                rules={[
                                                    { required: true, message: 'Por favor ingresa tu email' },
                                                    { type: 'email', message: 'Por favor ingresa un email válido' }
                                                ]}
                                            >
                                                <Input disabled />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="telefono"
                                                label="Teléfono"
                                                rules={[{ required: true, message: 'Por favor ingresa tu teléfono' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="rut"
                                                label="RUT"
                                                rules={[{ required: true, message: 'Por favor ingresa tu RUT' }]}
                                            >
                                                <Input disabled />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="cargo"
                                                label="Cargo"
                                                rules={[{ required: true, message: 'Por favor ingresa tu cargo' }]}
                                            >
                                                <Input disabled />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="fecha_nacimiento"
                                                label="Fecha de Nacimiento"
                                                rules={[{ required: true, message: 'Por favor ingresa tu fecha de nacimiento' }]}
                                            >
                                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            icon={<SaveOutlined />}
                                            style={{ background: '#ff0000', borderColor: '#ff0000' }}
                                        >
                                            Guardar Cambios
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>

                            <TabPane tab="Cambiar Contraseña" key="password">
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handlePasswordChange}
                                >
                                    <Form.Item
                                        name="currentPassword"
                                        label="Contraseña Actual"
                                        rules={[{ required: true, message: 'Por favor ingresa tu contraseña actual' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item
                                        name="newPassword"
                                        label="Nueva Contraseña"
                                        rules={[
                                            { required: true, message: 'Por favor ingresa tu nueva contraseña' },
                                            { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item
                                        name="confirmPassword"
                                        label="Confirmar Contraseña"
                                        dependencies={['newPassword']}
                                        rules={[
                                            { required: true, message: 'Por favor confirma tu nueva contraseña' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('newPassword') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Las contraseñas no coinciden'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            icon={<SaveOutlined />}
                                            style={{ background: '#ff0000', borderColor: '#ff0000' }}
                                        >
                                            Cambiar Contraseña
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;