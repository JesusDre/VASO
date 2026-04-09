import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth
import Login from '../modules/auth/Login';
import Register from '../modules/auth/Register';


const creador = ['creador', 'admin'];
const adminOnly = ['admin'];

const protect = (roles, element) => (
    <ProtectedRoute rolesPermitidos={roles}>{element}</ProtectedRoute>
);

const routes = [
    // ── Autenticación ─────────────────────────────────────────
    { path: '/login',    element: <Login /> },
    { path: '/registro', element: <Register /> },

  

    // ── Fallback ──────────────────────────────────────────────
    { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;
