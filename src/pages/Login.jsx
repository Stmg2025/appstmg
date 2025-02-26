import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Form, Input, Button, Card, message, Typography, notification } from 'antd';
import { LockOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';
import logo from '../assets/logo.png'; // Asegúrate de que la ruta sea correcta

const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // Configurar duración predeterminada para mensajes
    useEffect(() => {
        // Ajustar la configuración global de mensajes
        message.config({
            top: 72,
            duration: 3,
            maxCount: 3,
        });
    }, []);

    const handleLogin = async (values) => {
        setLoading(true);

        // Clave para la notificación
        const notificationKey = 'loginNotification';

        try {
            // Mostrar notificación en lugar de mensaje para mayor visibilidad
            notification.open({
                key: notificationKey,
                message: 'Iniciando sesión',
                description: 'Verificando credenciales...',
                icon: <LoginOutlined style={{ color: '#1890ff' }} />,
                duration: 0, // No desaparecerá automáticamente
            });

            const response = await fetch('https://stmg.cl/node-server/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.username,
                    password: values.password,
                }),
            });

            const data = await response.json();
            console.log("Respuesta de la API:", data);

            // Cerrar la notificación anterior - método correcto
            notification.destroy(notificationKey);

            if (response.ok) {
                const userData = {
                    token: data.token,
                    user: data.user,
                };

                // Guardar en localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(userData));

                // Actualizar contexto
                login(userData);

                // Mostrar notificación de éxito
                notification.success({
                    message: '¡Sesión iniciada!',
                    description: `Bienvenido, ${data.user.nombre} ${data.user.apellido}`,
                    duration: 4,
                    placement: 'topRight'
                });

                // Limpiar el formulario
                form.resetFields();

                // Redireccionar después de una pequeña pausa para que el usuario vea la notificación
                setTimeout(() => {
                    navigate('/usuarios');
                }, 1000);
            } else {
                // Notificación de error
                notification.error({
                    message: 'Error de autenticación',
                    description: data.message || 'Credenciales incorrectas',
                    duration: 5,
                    placement: 'topRight'
                });

                // Sacudir el campo de contraseña para indicar error
                form.setFields([
                    {
                        name: 'password',
                        errors: ['Contraseña incorrecta']
                    }
                ]);
            }
        } catch (error) {
            console.error("Error durante el login:", error);

            notification.error({
                message: 'Error de conexión',
                description: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
                duration: 5,
                placement: 'topRight'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#F0F2F5',
            backgroundImage: 'linear-gradient(to right bottom, #f0f2f5, #e6e9f0)'
        }}>
            <Card
                title={
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <img
                            src={logo}
                            alt="Logo Maigas"
                            style={{ height: '60px', marginBottom: '15px' }}
                        />
                        <Title level={3}>Iniciar Sesión</Title>
                    </div>
                }
                style={{
                    width: 380,
                    borderRadius: '12px',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden'
                }}
                headStyle={{ borderBottom: 'none', padding: '24px 24px 0 24px' }}
                bodyStyle={{ padding: '24px' }}
            >
                <Form
                    form={form}
                    onFinish={handleLogin}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Ingresa tu correo electrónico' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Correo Electrónico"
                            autoComplete="email"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Contraseña"
                            autoComplete="current-password"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{
                                height: '42px',
                                fontWeight: '500',
                                background: '#ff0000',
                                borderColor: '#ff0000'
                            }}
                        >
                            Iniciar Sesión
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;