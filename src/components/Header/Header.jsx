import React, { useEffect } from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png'; // Importamos el logo

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header = () => {
    const { isAuthenticated, logout, user } = useAuth(); // Obtenemos datos del usuario
    const location = useLocation();
    const navigate = useNavigate();

    // 👀 Verificar si `user` tiene datos en la consola
    useEffect(() => {
        console.log("🔍 Datos del usuario en Header:", user);
    }, [user]);

    // Si no está autenticado, no mostrar el menú
    if (!isAuthenticated) {
        return (
            <AntHeader style={{ background: '#fff', padding: '0 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Title level={3} style={{ margin: '16px 0', display: 'inline-block' }}>Servicio Técnico Maigas</Title>
            </AntHeader>
        );
    }

    // Ítems del menú principal
    const menuItems = [
        {
            key: 'dashboard',
            label: <Link to="/">Dashboard</Link>
        },
        {
            key: 'users',
            label: 'Usuarios',
            children: [
                { key: 'userList', label: <Link to="/users">Ver Usuarios</Link> },
                { key: 'userCreate', label: <Link to="/users/create">Crear Usuario</Link> },
                { type: 'divider' },
                { key: 'roleList', label: <Link to="/roles">Ver Roles</Link> },
                { key: 'roleCreate', label: <Link to="/roles/create">Crear Rol</Link> }
            ]
        },
        {
            key: 'inventory',
            label: 'Inventario',
            children: [
                { key: 'inventoryList', label: <Link to="/inventory">Ver Inventario</Link> },
                { key: 'inventoryCreate', label: <Link to="/inventory/create">Agregar Item</Link> }
            ]
        }
    ];

    // Determinar la clave seleccionada basada en la ruta actual
    const getSelectedKey = () => {
        const path = location.pathname;
        if (path === '/') return 'dashboard';
        if (path.includes('/users') || path.includes('/roles')) return 'users';
        if (path.includes('/inventory')) return 'inventory';
        return '';
    };

    // Manejar el cierre de sesión
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AntHeader style={{ background: '#fff', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* LOGO */}
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

            {/* Mostrar la información del usuario SOLO si `user` está definido */}
            {user && user.name && user.cargo && user.role ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginRight: '15px' }}>
                    <Text strong>{user.name}</Text>
                    <Text type="secondary">{user.cargo}</Text>
                    <Text type="danger">{user.role}</Text>
                </div>
            ) : (
                <Text type="secondary" style={{ marginRight: '15px' }}>Cargando usuario...</Text>
            )}

            <Button type="primary" onClick={handleLogout}>
                Cerrar Sesión
            </Button>
        </AntHeader>
    );
};

export default Header;

