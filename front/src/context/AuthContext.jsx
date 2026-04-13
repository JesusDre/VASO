import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, readUsuarios, readRoles } from '../services/api';

const AuthContext = createContext(null);

// Decodifica el payload del JWT sin libreria externa
function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

// Clasifica el rol segun el nombre guardado en la BD
function clasificarRol(nombreRol = '') {
    const n = nombreRol.toLowerCase();
    if (n.includes('admin')) return 'admin';
    if (n.includes('creador')) return 'creador';
    return 'lector';
}

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        try { return JSON.parse(localStorage.getItem('usuario')); } catch { return null; }
    });
    const [rol, setRol] = useState(() => localStorage.getItem('rol') || null);
    const [cargando, setCargando] = useState(!localStorage.getItem('usuario'));

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token && !usuario) {
            cargarPerfil(token).finally(() => setCargando(false));
        } else {
            setCargando(false);
        }
    }, []);

    const cargarPerfil = async (token) => {
        try {
            const payload = decodeJwt(token);
            if (!payload?.user_id) throw new Error('Token sin user_id');

            const [resUsuarios, resRoles] = await Promise.all([readUsuarios(), readRoles()]);
            const user = resUsuarios.data.find((u) => u.id === payload.user_id);
            if (!user) throw new Error('Usuario no encontrado');

            const rolObj = resRoles.data.find((r) => r.id === user.id_rol);
            const rolNombre = clasificarRol(rolObj?.nombre_rol || '');

            setUsuario(user);
            setRol(rolNombre);
            localStorage.setItem('usuario', JSON.stringify(user));
            localStorage.setItem('rol', rolNombre);
        } catch (err) {
            console.error('Error al cargar perfil:', err);
            limpiarSesion();
        }
    };

    const limpiarSesion = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('rol');
        setUsuario(null);
        setRol(null);
    };

    const login = async (credentials) => {
        const res = await loginUser(credentials);
        const { access, refresh } = res.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        await cargarPerfil(access);
        return res;
    };

    const logout = limpiarSesion;

    return (
        <AuthContext.Provider value={{ usuario, rol, cargando, login, logout, isAuthenticated: !!usuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}
