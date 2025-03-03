import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/Layout';
import Home from './pages/Home';
import Usuarios from './pages/Usuarios';
import Solicitudes from './pages/Solicitudes'; // ✅ Nueva página de solicitudes
import Login from './pages/Login';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas por autenticación */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="solicitudes" element={<Solicitudes />} /> {/* ✅ Nueva ruta */}
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
