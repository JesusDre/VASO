import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth
import Login from '../modules/auth/Login';
import Register from '../modules/auth/Register';

// Público
import Home from '../modules/public/Home';
import DetalleHistoria from '../modules/public/DetalleHistoria';
import LectorNovela from '../modules/public/LectorNovela';

// Creador
import DashboardCreador from '../modules/creador/DashboardCreador';
import EditorHistoria from '../modules/creador/EditorHistoria';
import Biblioteca from '../modules/creador/Biblioteca';

// Admin
import AdminPanel from '../modules/admin/AdminPanel';

// Legacy CRUDs
import HistoriasApp from '../modules/admin/legacy/HistoriasApp';
import NodosApp from '../modules/creador/legacy/NodosApp';
import PersonajesApp from '../modules/creador/legacy/PersonajesApp';
import RecursosApp from '../modules/creador/legacy/RecursosApp';
import UsuariosApp from '../modules/admin/legacy/UsuariosApp';

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
    { path: '/',                  element: <Home /> },
    { path: '/historia/:id',      element: <DetalleHistoria /> },
    { path: '/leer/:historiaId',  element: <LectorNovela /> },

    // ── Creador ───────────────────────────────────────────────
    { path: '/creador',                  element: protect(creador, <DashboardCreador />) },
    { path: '/creador/nueva',            element: protect(creador, <EditorHistoria />) },
    { path: '/creador/historia/:id',     element: protect(creador, <EditorHistoria />) },
    { path: '/creador/biblioteca',       element: protect(creador, <Biblioteca />) },

    // Legacy creador
    { path: '/nodos',      element: protect(creador, <NodosApp />) },
    { path: '/personajes', element: protect(creador, <PersonajesApp />) },
    { path: '/recursos',   element: protect(creador, <RecursosApp />) },

    // ── Admin ─────────────────────────────────────────────────
    { path: '/admin',      element: protect(adminOnly, <AdminPanel />) },

    // Legacy admin
    { path: '/historias',  element: protect(adminOnly, <HistoriasApp />) },
    { path: '/usuarios',   element: protect(adminOnly, <UsuariosApp />) },

    // ── Fallback ──────────────────────────────────────────────
    { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;
