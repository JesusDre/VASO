import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth
import Login from '../modules/auth/Login';
import Register from '../modules/auth/Register';

// IMPORTANTE: Comentamos lo que aún no existe para que no truene
// import Home from '../modules/public/Home'; 
// import DetalleHistoria from '../modules/public/DetalleHistoria';
// ... etc

const creador = ['creador', 'admin'];
const adminOnly = ['admin'];

const protect = (roles, element) => (
    <ProtectedRoute rolesPermitidos={roles}>{element}</ProtectedRoute>
);

const routes = [
    // ── Autenticación ─────────────────────────────────────────
    { path: '/login',    element: <Login /> },
    { path: '/registro', element: <Register /> },

    // ── Público ───────────────────────────────────────────────
    // Usamos el Login como Home temporal para que veas algo apenas abras la app
    { path: '/',         element: <Login /> }, 

    /* Descomenta estos conforme me vayas pasando los archivos:
    { path: '/creador',  element: protect(creador, <DashboardCreador />) },
    */

    // ── Fallback ──────────────────────────────────────────────
    { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;