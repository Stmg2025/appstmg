// src/components/AppHeader.jsx
import { useContext } from 'react';
import { Layout, Menu, Button, Typography, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logoImage from '../assets/logo.png';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Opciones para el menú desplegable del usuario
    const items = [
        {
            key: 'profile',
            label: 'Mi Perfil',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile')
        },
        {
            key: 'logout',
            label: 'Cerrar Sesión',
            icon: <LogoutOutlined />,
            onClick: handleLogout
        }
    ];

    return (
        <Header style={{
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            position: 'fixed',
            width: '100%',
            top: 0,
            zIndex: 1000
        }}>
            {/* Contenedor para logo y título */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginRight: '20px'
            }}>
                {/* Logo */}
                <img
                    src={logoImage}
                    alt="Logo Maigas"
                    style={{
                        height: '40px',
                        marginRight: '15px',
                        objectFit: 'contain'
                    }}
                />

                {/* Título */}
                <div style={{
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: 'bold'
                }}>
                    Servicio Técnico Maigas
                </div>
            </div>

            {user && (
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    style={{ background: 'transparent', flex: 1, borderBottom: 'none' }}
                    theme="dark"
                >
                    <Menu.Item key="/" style={location.pathname === '/' ? { backgroundColor: '#ff0000' } : {}}>
                        <Link to="/" style={{ color: '#ffffff' }}>Inicio</Link>
                    </Menu.Item>
                    <Menu.Item key="/usuarios" style={location.pathname === '/usuarios' ? { backgroundColor: '#ff0000' } : {}}>
                        <Link to="/usuarios" style={{ color: '#ffffff' }}>Usuarios</Link>
                    </Menu.Item>
                </Menu>
            )}

            {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Dropdown menu={{ items }} placement="bottomRight">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '0 10px'
                        }}>
                            {user.user.fotografia ? (
                                <img
                                    src={`https://stmg.cl/node-server${user.user.fotografia}`}
                                    alt={`${user.user.nombre}`}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        marginRight: '8px',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <UserOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#ffffff' }} />
                            )}
                            <Text style={{ color: '#ffffff' }}>
                                {user.user.nombre} {user.user.apellido}
                            </Text>
                            <SettingOutlined style={{ marginLeft: '5px', color: '#ffffff', fontSize: '12px' }} />
                        </div>
                    </Dropdown>
                </div>
            )}
        </Header>
    );
};

export default AppHeader;