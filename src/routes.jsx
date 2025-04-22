import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';

// Auth
import Login from './pages/Auth/Login';

// Users
import UserList from './pages/Users/UserList';
import UserCreate from './pages/Users/UserCreate';
import UserView from './pages/Users/UserView';
import UserEdit from './pages/Users/UserEdit';
import UserProfile from './pages/Users/UserProfile';

// Roles
import RoleList from './pages/Roles/RoleList';
import RoleCreate from './pages/Roles/RoleCreate';
import RoleView from './pages/Roles/RoleView';
import RoleEdit from './pages/Roles/RoleEdit';

// Inventory
import InventoryList from './pages/Inventory/InventoryList';
import InventoryCreate from './pages/Inventory/InventoryCreate';
import InventoryView from './pages/Inventory/InventoryView';
import InventoryEdit from './pages/Inventory/InventoryEdit';

// Solicitudes
import SolicitudList from './pages/Solicitudes/SolicitudList';
import SolicitudCreate from './pages/Solicitudes/SolicitudCreate';
import SolicitudView from './pages/Solicitudes/SolicitudView';
import SolicitudEdit from './pages/Solicitudes/SolicitudEdit';

// Estado de Solicitud
import EstadoSolicitudList from './pages/EstadoSolicitud/EstadoSolicitudList';
import EstadoSolicitudCreate from './pages/EstadoSolicitud/EstadoSolicitudCreate';
import EstadoSolicitudView from './pages/EstadoSolicitud/EstadoSolicitudView';
import EstadoSolicitudEdit from './pages/EstadoSolicitud/EstadoSolicitudEdit';

// Tecnicos
import TecnicoList from './pages/Tecnicos/TecnicoList';
import TecnicoView from './pages/Tecnicos/TecnicoView';
import TecnicoEdit from './pages/Tecnicos/TecnicoEdit';

// Clientes
import ClienteList from './pages/Clientes/ClienteList';
import ClienteCreate from './pages/Clientes/ClienteCreate';
import ClienteView from './pages/Clientes/ClienteView';
import ClienteEdit from './pages/Clientes/ClienteEdit';

// Dashboard
import Dashboard from './pages/Dashboard/Dashboard';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Componente para redirigir si ya está autenticado
const RedirectIfAuthenticated = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Ruta pública de login */}
            <Route
                path="/login"
                element={
                    <RedirectIfAuthenticated>
                        <Login />
                    </RedirectIfAuthenticated>
                }
            />

            {/* Ruta de inicio - ahora muestra el Dashboard */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Ruta de perfil de usuario */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <UserProfile />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Rutas protegidas de Usuarios */}
            <Route
                path="/users"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <UserList />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users/create"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <UserCreate />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <UserView />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users/edit/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <UserEdit />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Rutas protegidas de Roles */}
            <Route
                path="/roles"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <RoleList />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/roles/create"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <RoleCreate />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/roles/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <RoleView />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/roles/edit/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <RoleEdit />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Rutas protegidas de Inventario */}
            <Route
                path="/inventory"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <InventoryList />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/inventory/create"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <InventoryCreate />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/inventory/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <InventoryView />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/inventory/edit/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <InventoryEdit />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Rutas protegidas de Solicitudes */}
            <Route
                path="/solicitudes"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <SolicitudList />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/solicitudes/create"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <SolicitudCreate />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/solicitudes/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <SolicitudView />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/solicitudes/edit/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <SolicitudEdit />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Rutas protegidas de Estado de Solicitud */}
            <Route
                path="/estados-solicitud"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <EstadoSolicitudList />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/estados-solicitud/create"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <EstadoSolicitudCreate />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/estados-solicitud/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <EstadoSolicitudView />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/estados-solicitud/edit/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <EstadoSolicitudEdit />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Rutas protegidas de Técnicos */}
            <Route
                path="/tecnicos"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <TecnicoList />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tecnicos/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <TecnicoView />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tecnicos/edit/:id"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <TecnicoEdit />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Rutas protegidas de Clientes */}
            <Route
                path="/clientes"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <ClienteList />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/clientes/create"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <ClienteCreate />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/clientes/:codaux"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <ClienteView />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/clientes/edit/:codaux"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <ClienteEdit />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Ruta para manejar rutas no encontradas */}
            <Route
                path="*"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <h1>404</h1>
                                <p>Página no encontrada</p>
                            </div>
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AppRoutes;