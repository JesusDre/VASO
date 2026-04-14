import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContadorVisitas } from '../hooks/useContadorVisitas';
import '../styles/navbar.css';

function IconUser() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

function IconChevron() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

function IconList() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    );
}

function IconPlus() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    );
}

function IconBook() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
    );
}

export default function Navbar() {
    const { usuario, rol, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [proyectosOpen, setProyectosOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { total } = useContadorVisitas();

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/')
            ? 'nv-nav-link is-active'
            : 'nv-nav-link';

    useEffect(() => {
        setMobileOpen(false);
        setProyectosOpen(false);
    }, [location.pathname]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProyectosOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="nv-navbar">
            <div className="nv-navbar-inner">
                {/* Logo */}
                <Link className="nv-brand" to="/">
                    <div className="nv-brand-icon">C</div>
                    <span className="nv-brand-name">Novelas de Chucho</span>
                </Link>

                {/* Contador de visitas */}
                {total !== null && (
                    <span className="nv-visit-counter" title="Visitas totales al sitio">
                        Visitas {total.toLocaleString()}
                    </span>
                )}

                {/* Mobile toggle */}
                <button
                    className="nv-mobile-toggle"
                    type="button"
                    aria-label="Abrir menu"
                    onClick={() => setMobileOpen((prev) => !prev)}
                >
                    <span /><span /><span />
                </button>

                {/* Nav panel */}
                <div className={`nv-navbar-panel ${mobileOpen ? 'is-open' : ''}`}>
                    <ul className="nv-nav-list">
                        <li>
                            <Link className={isActive('/')} to="/">Catálogo</Link>
                        </li>

                        {(rol === 'creador' || rol === 'admin') && (
                            <li ref={dropdownRef} className="nv-dropdown">
                                <button
                                    className={`nv-dropdown-toggle ${proyectosOpen ? 'is-open' : ''}`}
                                    onClick={() => setProyectosOpen((p) => !p)}
                                >
                                    Proyectos
                                    <IconChevron />
                                </button>

                                {proyectosOpen && (
                                    <div className="nv-dropdown-menu">
                                        <Link className="nv-dropdown-item" to="/creador">
                                            <IconList />
                                            Mis Proyectos
                                        </Link>
                                        <Link className="nv-dropdown-item" to="/creador/nueva">
                                            <IconPlus />
                                            Nuevo Proyecto
                                        </Link>
                                        <Link className="nv-dropdown-item" to="/creador/biblioteca">
                                            <IconBook />
                                            Biblioteca
                                        </Link>
                                    </div>
                                )}
                            </li>
                        )}

                        {rol === 'admin' && (
                            <li>
                                <Link className={isActive('/admin')} to="/admin">Admin</Link>
                            </li>
                        )}
                    </ul>

                    {/* Auth area */}
                    <div className="nv-auth-area">
                        {usuario ? (
                            <>
                                <div className="nv-user-info">
                                    <div className="nv-user-meta">
                                        <div className="nv-user-role-label">
                                            {rol === 'creador' ? 'Creator' : rol === 'admin' ? 'Admin' : 'Lector'}
                                        </div>
                                        <div className="nv-user-name">{usuario.nombre}</div>
                                    </div>
                                    <div className="nv-user-avatar">
                                        <IconUser />
                                    </div>
                                </div>
                                <span className={`nv-role-badge nv-role-${rol}`}>
                                    {rol === 'creador' ? 'Creador' : rol === 'admin' ? 'Admin' : 'Lector'}
                                </span>
                                <button className="nv-btn-logout" onClick={handleLogout}>
                                    Salir
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="nv-btn nv-btn-primary" onClick={() => navigate('/login')}>
                                    Acceder
                                </button>
                                <span className="nv-role-badge nv-role-visitante">
                                    Visitante
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
