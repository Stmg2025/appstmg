import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import Header from '../Header/Header';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
    const location = useLocation();

    // Función para generar las migas de pan basadas en la ruta actual
    const generateBreadcrumbs = () => {
        const pathSnippets = location.pathname.split('/').filter(i => i);
        const breadcrumbItems = [];

        breadcrumbItems.push({
            title: <Link to="/">Inicio</Link>,
            key: 'home'
        });

        pathSnippets.forEach((_, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
            let title = pathSnippets[index].charAt(0).toUpperCase() + pathSnippets[index].slice(1);

            // Modificar el título según el contexto
            if (pathSnippets[index] === 'create') {
                title = 'Crear';
            } else if (pathSnippets[index] === 'edit') {
                title = 'Editar';
            } else if (!isNaN(pathSnippets[index])) {
                title = 'Detalle';
            }

            breadcrumbItems.push({
                title: index === pathSnippets.length - 1 ? title : <Link to={url}>{title}</Link>,
                key: url
            });
        });

        return breadcrumbItems;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header />
            <Content style={{ padding: '0 50px', marginTop: 20 }}>
                <Breadcrumb items={generateBreadcrumbs()} style={{ margin: '16px 0' }} />
                <div style={{ background: '#fff', padding: 24, minHeight: 280, borderRadius: 4 }}>
                    {children}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                STMG Admin ©{new Date().getFullYear()} - Sistema de Administración
            </Footer>
        </Layout>
    );
};

export default MainLayout;