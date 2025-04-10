import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import logo from '../../assets/logo.png';
import logoMaigas from '../../assets/LOGO_MAIGAS_ALTA.png';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
    const location = useLocation();
    const headerHeight = 64; // Standard Ant Design header height

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
        <Layout>
            <div style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 10
            }}>
                <Header />
            </div>

            <Content style={{
                marginTop: headerHeight,
                padding: '20px 50px 20px',
                minHeight: `calc(100vh - ${headerHeight}px)`,
                overflow: 'auto'
            }}>
                <Breadcrumb items={generateBreadcrumbs()} style={{ margin: '16px 0' }} />
                <div style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 4,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginBottom: 40
                }}>
                    {children}
                </div>

                <Footer style={{
                    padding: '15px 20px',
                    backgroundColor: '#fff',
                    boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <img src={logo} alt="Logo STMG" style={{ height: 30 }} />
                    <div>
                        Servicio Técnico Maigas ©{new Date().getFullYear()} - Sistema de Administración
                    </div>
                    <img src={logoMaigas} alt="Logo Maigas" style={{ height: 30 }} />
                </Footer>
            </Content>
        </Layout>
    );
};

export default MainLayout;