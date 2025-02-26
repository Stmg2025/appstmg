import { Layout } from 'antd';
import AppHeader from './Header';
import AppFooter from './Footer';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const AppLayout = () => {
    return (
        <Layout style={{ minHeight: '100vh', background: '#1E1E1E' }}> {/* Fondo gris oscuro */}
            {/* HEADER FIJO */}
            <AppHeader />

            {/* CONTENIDO CON SCROLL */}
            <Content style={{
                padding: '20px',
                background: '#2C2C2C', /* Fondo más claro para el contenido */
                color: '#FFFFFF',
                borderRadius: '8px', /* Bordes redondeados */
                margin: '100px auto 70px', /* Espaciado para evitar que se solape con el header/footer */
                width: '95%', /* Mejor ajuste del ancho */
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', /* Sombra suave */
                overflowY: 'auto', /* Habilita scroll solo en el contenido */
                minHeight: 'calc(100vh - 170px)' /* Ajuste para que siempre haya espacio para contenido */
            }}>
                <Outlet />
            </Content>

            {/* FOOTER FIJO */}
            <AppFooter />
        </Layout>
    );
};

export default AppLayout;
