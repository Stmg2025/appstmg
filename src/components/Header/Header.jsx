import React from 'react';
import { Layout, Menu, Button, Typography, Spin, Avatar, Space, Divider } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserOutlined } from '@ant-design/icons';
import logo from '../../assets/logo.png';
import logoMaigas from '../../assets/LOGO_MAIGAS_ALTA.png';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header = () => {
    const { isAuthenticated, logout, user, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return (
            <AntHeader style={{ background: '#fff', padding: '0 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Title level={3} style={{ margin: '16px 0', display: 'inline-block' }}>Servicio Técnico Maigas</Title>
            </AntHeader>
        );
    }

    const menuItems = [
        {
            key: 'dashboard',
            label: <Link to="/">Panel de Control</Link>
        },
        {
            key: 'administracion',
            label: 'Administración',
            children: [
                { key: 'userList', label: <Link to="/users">Ver Usuarios</Link> },
                { key: 'userCreate', label: <Link to="/users/create">Crear Usuario</Link> },
                { type: 'divider' },
                { key: 'tecnicosList', label: <Link to="/tecnicos">Ver Técnicos</Link> },
                { type: 'divider' },
                { key: 'roleList', label: <Link to="/roles">Ver Roles</Link> },
                { key: 'roleCreate', label: <Link to="/roles/create">Crear Rol</Link> },
                { type: 'divider' },
                { key: 'estadoSolicitudList', label: <Link to="/estados-solicitud">Ver Estados</Link> },
                { key: 'estadoSolicitudCreate', label: <Link to="/estados-solicitud/create">Crear Estado</Link> }
            ]
        },
        {
            key: 'inventory',
            label: 'Inventario',
            children: [
                { key: 'inventoryList', label: <Link to="/inventory">Ver Inventario</Link> },
                { key: 'inventoryCreate', label: <Link to="/inventory/create">Agregar Item</Link> }
            ]
        },
        {
            key: 'solicitudes',
            label: 'Solicitudes',
            children: [
                { key: 'solicitudesList', label: <Link to="/solicitudes">Ver Solicitudes</Link> },
                { key: 'solicitudesCreate', label: <Link to="/solicitudes/create">Nueva Solicitud</Link> }
            ]
        },
        {
            key: 'clientes',
            label: 'Clientes',
            children: [
                { key: 'clientesList', label: <Link to="/clientes">Ver Clientes</Link> },
                { key: 'clientesCreate', label: <Link to="/clientes/create">Nuevo Cliente</Link> }
            ]
        }
    ];

    const getSelectedKey = () => {
        const path = location.pathname;
        if (path === '/') return 'dashboard';
        if (path.includes('/users') || path.includes('/roles') || path.includes('/tecnicos') || path.includes('/estados-solicitud')) return 'administracion';
        if (path.includes('/inventory')) return 'inventory';
        if (path.includes('/solicitudes')) return 'solicitudes';
        if (path.includes('/clientes')) return 'clientes';
        return '';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Simplificado sin roles
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    const userCargo = user?.cargo || '';

    return (
        <AntHeader style={{ background: '#fff', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="Servicio Técnico Maigas" style={{ height: 40, marginRight: 10 }} />
                    <Title level={3} style={{ margin: 0, color: '#000000' }}>
                        Servicio Técnico Maigas
                    </Title>
                </Link>

                <Menu
                    mode="horizontal"
                    selectedKeys={[getSelectedKey()]}
                    style={{ flex: 1, minWidth: 600 }}
                    items={menuItems}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {loading ? (
                    <Spin />
                ) : user ? (
                    <Space align="center">
                        <Avatar
                            style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }}
                            icon={<UserOutlined />}
                        />
                        <Space direction="vertical" size={0} style={{ lineHeight: 1.2 }}>
                            <Text strong style={{ fontSize: '14px' }}>{firstName} {lastName}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{userCargo}</Text>
                        </Space>
                        <Button type="primary" size="small" onClick={handleLogout}>
                            Cerrar Sesión
                        </Button>
                    </Space>
                ) : (
                    <Text type="danger">Usuario no identificado</Text>
                )}
                <img src={logoMaigas} alt="Logo Maigas" style={{ height: 40, marginLeft: 5 }} />
            </div>
        </AntHeader>
    );
};

export default Header;