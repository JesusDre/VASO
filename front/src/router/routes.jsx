import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth
import Login from '../modules/auth/Login';
import Register from '../modules/auth/Register';

// Público
import Home from '../modules/public/Home';
import DetalleHistoria from '../modules/public/DetalleHistoria';
import LectorNovela from '../modules/public/LectorNovela';

// Admin
import AdminPanel from '../modules/admin/AdminPanel/index.jsx';

// Legacy Admin
import HistoriasApp from '../modules/admin/legacy/HistoriasApp';
import UsuariosApp from '../modules/admin/legacy/UsuariosApp';

const adminOnly = ['admin'];

const protect = (roles, element) => (
    <ProtectedRoute rolesPermitidos={roles}>{element}</ProtectedRoute>
);

const routes = [
    // ── Autenticación ─────────────────────────────────────────
    { path: '/login', element: <Login /> },
    { path: '/registro', element: <Register /> },

    // ── Público ───────────────────────────────────────────────
    { path: '/', element: <Home /> },
    { path: '/historia/:id', element: <DetalleHistoria /> },
    { path: '/leer/:historiaId', element: <LectorNovela /> },

    // ── Admin ─────────────────────────────────────────────────
    { path: '/admin', element: protect(adminOnly, <AdminPanel />) },

    // Legacy admin
    { path: '/historias', element: protect(adminOnly, <HistoriasApp />) },
    { path: '/usuarios', element: protect(adminOnly, <UsuariosApp />) },

    // ── Fallback ──────────────────────────────────────────────
    { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;