import React, { useEffect } from 'react';
import { Layout, Menu, Button, Typography, Spin } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header = () => {
    const { isAuthenticated, logout, user, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("🔍 Datos del usuario en Header:", user);
    }, [user]);

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
            label: <Link to="/">Dashboard</Link>
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
        }
    ];

    const getSelectedKey = () => {
        const path = location.pathname;
        if (path === '/') return 'dashboard';
        if (path.includes('/users') || path.includes('/roles') || path.includes('/tecnicos') || path.includes('/estados-solicitud')) return 'administracion';
        if (path.includes('/inventory')) return 'inventory';
        if (path.includes('/solicitudes')) return 'solicitudes';
        return '';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

            {loading ? (
                <Spin style={{ marginRight: '15px' }} />
            ) : user && user.name ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginRight: '15px' }}>
                    <Text strong>{user.name}</Text>
                    <Text type="secondary">{user.cargo}</Text>
                    <Text type="danger">{user.role}</Text>
                </div>
            ) : (
                <Text type="danger" style={{ marginRight: '15px' }}>Usuario no identificado</Text>
            )}

            <Button type="primary" onClick={handleLogout}>
                Cerrar Sesión
            </Button>
        </AntHeader>
    );
};

export default Header;