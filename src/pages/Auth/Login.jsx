import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import logoMaigas from '../../assets/LOGO_MAIGAS_ALTA.png';
import backgroundImage from '../../assets/FLOTA.png';

const { Title, Text } = Typography;

// Custom loading component with brand colors
const CustomLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
        {[...Array(3)].map((_, i) => (
            <div
                key={i}
                style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: i === 0 ? '#b00000' : i === 1 ? '#ffffff' : '#000000',
                    animation: 'pulseAnimation 1.2s infinite ease-in-out',
                    animationDelay: `${i * 0.2}s`
                }}
            />
        ))}
        <style jsx>{`
      @keyframes pulseAnimation {
        0%, 100% { transform: scale(0.8); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 1; }
      }
    `}</style>
    </div>
);

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            setError('');
            const { email, password } = values;
            await login(email, password);
            message.success('¡Inicio de sesión exitoso!');
            navigate('/');
        } catch (err) {
            setError('Credenciales incorrectas. Por favor, intente nuevamente.');
            message.error('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* Overlay with diagonal design */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(180,0,0,0.6) 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
                }}
            />

            <Card
                style={{
                    width: 480,
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 25px rgba(0, 0, 0, 0.4)',
                    position: 'relative',
                    zIndex: 1,
                    border: 'none',
                }}
            >
                {/* Red header stripe */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 10,
                        background: 'linear-gradient(90deg, #b00000 0%, #ff0000 100%)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                />

                <div style={{ padding: '30px 40px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 35 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                            <img src={logo} alt="Logo" style={{ height: 70, marginRight: 20 }} />
                            <img src={logoMaigas} alt="Logo Maigas" style={{ height: 60 }} />
                        </div>
                        <Title level={3} style={{ marginBottom: 8, color: '#000000', fontWeight: 700 }}>
                            Servicio Técnico Maigas
                        </Title>
                        <div style={{ width: 60, height: 3, background: '#b00000', margin: '10px auto' }} />
                        <Text style={{ fontSize: '16px', color: '#444', display: 'block' }}>
                            Sistema de Administración y Gestión
                        </Text>
                    </div>

                    {error && (
                        <div style={{
                            color: '#ffffff',
                            textAlign: 'center',
                            marginBottom: 20,
                            backgroundColor: '#d10000',
                            padding: '10px 15px',
                            borderRadius: 6,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                            fontWeight: 'bold'
                        }}>
                            {error}
                        </div>
                    )}

                    <Form
                        name="login_form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        size="large"
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: 'Por favor ingrese su correo electrónico' }]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#666' }} />}
                                placeholder="Correo electrónico"
                                style={{
                                    height: 55,
                                    borderRadius: 8,
                                    border: '1px solid #ddd',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1) inset',
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#666' }} />}
                                placeholder="Contraseña"
                                style={{
                                    height: 55,
                                    borderRadius: 8,
                                    border: '1px solid #ddd',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1) inset',
                                }}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                style={{
                                    height: 55,
                                    borderRadius: 8,
                                    background: 'linear-gradient(45deg, #b00000 0%, #dd0000 100%)',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    marginTop: 15,
                                    boxShadow: '0 4px 15px rgba(200,0,0,0.3)',
                                }}
                            >
                                {loading ? <CustomLoader /> : (
                                    <>
                                        <SafetyOutlined style={{ marginRight: 8 }} />
                                        Iniciar sesión
                                    </>
                                )}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{
                        textAlign: 'center',
                        marginTop: 30,
                        borderTop: '1px solid #eee',
                        paddingTop: 20,
                        paddingBottom: 10,
                        background: 'linear-gradient(to bottom, #fff, #f5f5f5)',
                        borderRadius: '0 0 12px 12px',
                        margin: '25px -40px -30px -40px',
                        padding: '20px 40px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: 8, height: 8, backgroundColor: '#b00000', borderRadius: '50%' }}></div>
                            <Text style={{ fontSize: 13, color: '#333', fontWeight: 'bold' }}>
                                Servicio Técnico Maigas © {new Date().getFullYear()}
                            </Text>
                            <div style={{ width: 8, height: 8, backgroundColor: '#b00000', borderRadius: '50%' }}></div>
                        </div>
                        <div style={{ fontSize: 12, color: '#777', marginTop: 5 }}>
                            Soluciones profesionales en reparación y mantenimiento
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Login;