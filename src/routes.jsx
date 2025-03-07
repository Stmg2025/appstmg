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
