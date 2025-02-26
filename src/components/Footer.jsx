import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => {
    return (
        <Footer style={{
            textAlign: 'center',
            background: '#000000', /* Fondo negro */
            color: '#FFFFFF', /* Letras blancas */
            position: 'fixed',
            bottom: 0,
            width: '100%',
            padding: '10px 0'
        }}>
            STMG ©{new Date().getFullYear()} - Todos los derechos reservados
        </Footer>
    );
};

export default AppFooter;
