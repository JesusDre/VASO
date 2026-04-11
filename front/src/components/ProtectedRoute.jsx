import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * rolesPermitidos: array de roles que pueden acceder, ej: ['admin', 'creador']
 * Si no se pasa, cualquier usuario autenticado puede acceder.
 */
export default function ProtectedRoute({ children, rolesPermitidos }) {
    const { usuario, rol, cargando } = useAuth();

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    if (!usuario) return <Navigate to="/login" replace />;

    if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
