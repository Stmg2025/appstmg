# 📌 STMGApp - Frontend

## 🚀 Descripción
Este es el frontend de **STMGApp (Servicio Técnico Maigas)**, desarrollado con **React.js y Ant Design**. La aplicación permite la gestión de usuarios, roles e inventario a través de una interfaz moderna y responsiva.

## 🏗️ **Tecnologías Utilizadas**
- **React.js** (Framework principal)
- **Vite** (Entorno de desarrollo rápido)
- **React Router** (Navegación entre páginas)
- **Ant Design** (UI Components)
- **Axios** (Manejo de peticiones HTTP)
- **Context API** (Manejo de autenticación y estado global)
- **ConfigProvider de Ant Design** (Personalización de temas)

## 🎨 **Personalización del Tema**
### 🌑 **Modo Oscuro y Colores**
La aplicación usa un **tema oscuro** con **rojo (#D32F2F) como color principal**.
Se configura en `App.jsx` con `ConfigProvider`:

```jsx
<ConfigProvider
  locale={esES}
  theme={{
    algorithm: theme.darkAlgorithm, // Activa el tema oscuro
    token: {
      colorPrimary: '#D32F2F',
      colorText: '#FFFFFF',
      colorBgContainer: '#121212',
    }
  }}
>
```

## 📂 **Estructura del Proyecto**
```
📦 src
 ┣ 📂 assets            # Recursos estáticos (logo, imágenes)
 ┣ 📂 components        # Componentes reutilizables (Layout, Header, Sidebar)
 ┣ 📂 context           # Manejo del estado global (AuthContext)
 ┣ 📂 pages             # Páginas principales de la app
 ┃ ┣ 📂 Auth           # Páginas de autenticación (Login)
 ┃ ┣ 📂 Dashboard      # Página principal con métricas clave
 ┃ ┣ 📂 Users         # Gestión de usuarios
 ┃ ┣ 📂 Roles         # Gestión de roles
 ┃ ┣ 📂 Inventory     # Gestión del inventario
 ┣ 📂 services         # API Services (Peticiones HTTP con Axios)
 ┣ 📂 styles           # Archivos de estilos globales
 ┣ 📜 App.jsx         # Configuración principal de React y el tema
 ┣ 📜 routes.jsx      # Configuración de rutas con React Router
 ┣ 📜 main.jsx        # Punto de entrada de la aplicación
```

## 🔑 **Autenticación y Protección de Rutas**
- Se utiliza `AuthContext` para gestionar el estado de autenticación.
- Rutas protegidas en `routes.jsx`:

```jsx
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Cargando...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};
```

## 🖥️ **Dashboard** (Página de Inicio)
El Dashboard muestra:
✅ Total de repuestos en inventario  
✅ Repuestos con **stock bajo**  
✅ Repuesto **más costoso y más económico**

```jsx
<Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
```

## 📌 **Header y Menú de Navegación**
- Incluye el logo de **Servicio Técnico Maigas**.
- Menú con **Dashboard, Usuarios, Roles e Inventario**.
- Tema oscuro aplicado al header.

```jsx
<AntHeader style={{ background: '#D32F2F' }}>
  <img src={logo} alt="Logo" style={{ height: 40, marginRight: 10 }} />
  <Title level={3} style={{ color: '#FFFFFF' }}>Servicio Técnico Maigas</Title>
</AntHeader>
```

## 🔄 **Manejo de Datos con Axios**
Se encapsulan las peticiones en `services`:

```jsx
const getUsers = () => axios.get('/api/users', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

## 🛠 **Comandos Útiles**
### 📦 Instalar dependencias
```bash
npm install
```
### 🚀 Ejecutar en desarrollo
```bash
npm run dev
```
### 🔨 Construir para producción
```bash
npm run build
```

## 📌 **Conclusión**
Este frontend está optimizado con React y Ant Design, con un tema oscuro y un diseño intuitivo. Se conecta con el backend a través de Axios y protege sus rutas con `AuthContext`.

🚀 **¡Listo para gestionar el inventario de Servicio Técnico Maigas!**

