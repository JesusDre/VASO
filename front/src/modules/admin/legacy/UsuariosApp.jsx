import { useState, useEffect } from 'react';
import {
    readUsuarios, deleteUsuario,
    readRoles, createRol, updateRol, deleteRol,
} from '../../../services/api';
import Navbar from '../../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';

// -----------------------------------------------------------
// Panel de Usuarios (listado + eliminar)
// -----------------------------------------------------------
function UsuariosPanel() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        cargar();
        readRoles().then((r) => setRoles(r.data)).catch(() => {});
    }, []);

    const cargar = async () => {
        setCargando(true);
        try { setUsuarios((await readUsuarios()).data); }
        catch { toast.error('Error al obtener usuarios'); }
        finally { setCargando(false); }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('Seguro que deseas eliminar este usuario?')) return;
        const tid = toast.loading('Eliminando...');
        try { await deleteUsuario(id); toast.success('Usuario eliminado', { id: tid }); cargar(); }
        catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const nombreRol = (id) => roles.find((r) => r.id === id)?.nombre_rol || (id ? `Rol ${id}` : '—');

    const filtrados = usuarios.filter((u) =>
        `${u.nombre} ${u.apellido_paterno} ${u.email}`.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Lista de Usuarios</h5>
                    <input type="text" className="form-control form-control-sm" style={{ maxWidth: 250 }}
                        placeholder="Buscar nombre o email..." value={filtro}
                        onChange={(e) => setFiltro(e.target.value)} />
                </div>
                <p className="text-muted small">Para crear usuarios utiliza la pagina de <a href="/registro">Registro</a>.</p>

                {cargando ? (
                    <div className="text-center py-5"><div className="spinner-border text-dark" /><p className="mt-2 text-muted">Cargando...</p></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover table-sm align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th><th>Nombre</th><th>Email</th>
                                    <th>Rol</th><th>Activo</th><th>Registro</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center text-muted py-3">Sin resultados</td></tr>
                                ) : filtrados.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.nombre} {u.apellido_paterno} {u.apellido_materno || ''}</td>
                                        <td>{u.email}</td>
                                        <td>{nombreRol(u.id_rol)}</td>
                                        <td>
                                            {u.activo
                                                ? <span className="badge bg-success">Activo</span>
                                                : <span className="badge bg-danger">Inactivo</span>}
                                        </td>
                                        <td>{u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-MX') : '—'}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(u.id)}>
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// -----------------------------------------------------------
// Panel de Roles (CRUD completo)
// -----------------------------------------------------------
function RolesPanel() {
    const FORM_INICIAL = { nombre_rol: '' };

    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try { setRoles((await readRoles()).data); }
        catch { toast.error('Error al obtener roles'); }
        finally { setCargando(false); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErrores({});
        try {
            if (editandoId) { await updateRol(editandoId, formData); toast.success('Rol actualizado'); }
            else { await createRol(formData); toast.success('Rol creado'); }
            setFormData(FORM_INICIAL);
            setEditandoId(null);
            cargar();
        } catch (err) {
            if (err.response?.data) { setErrores(err.response.data); toast.error('Corrige los errores'); }
            else toast.error('Error de conexion');
        } finally { setCargandoGuardar(false); }
    };

    const prepararEdicion = (r) => {
        setFormData({ nombre_rol: r.nombre_rol });
        setEditandoId(r.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelar = () => { setFormData(FORM_INICIAL); setEditandoId(null); setErrores({}); };

    const handleEliminar = async (id) => {
        if (!window.confirm('Eliminar este rol?')) return;
        const tid = toast.loading('Eliminando...');
        try { await deleteRol(id); toast.success('Rol eliminado', { id: tid }); cargar(); }
        catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const filtrados = roles.filter((r) =>
        r.nombre_rol.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="row">
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-dark text-white">
                        <h5 className="mb-0">{editandoId ? 'Editar Rol' : 'Nuevo Rol'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Nombre del rol</label>
                                <input type="text" name="nombre_rol"
                                    className={`form-control ${errores.nombre_rol ? 'is-invalid' : ''}`}
                                    value={formData.nombre_rol} onChange={handleChange}
                                    required disabled={cargandoGuardar}
                                    placeholder="Ej: administrador, lector, creador" />
                                {errores.nombre_rol && <div className="invalid-feedback">{errores.nombre_rol.join(', ')}</div>}
                            </div>
                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-success" disabled={cargandoGuardar}>
                                    {cargandoGuardar
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                                        : editandoId ? 'Actualizar' : 'Guardar'}
                                </button>
                                {editandoId && (
                                    <button type="button" className="btn btn-secondary" onClick={cancelar} disabled={cargandoGuardar}>
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="col-md-8">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Lista de Roles</h5>
                            <input type="text" className="form-control form-control-sm" style={{ maxWidth: 220 }}
                                placeholder="Buscar rol..." value={filtro}
                                onChange={(e) => setFiltro(e.target.value)} />
                        </div>
                        {cargando ? (
                            <div className="text-center py-5"><div className="spinner-border text-dark" /><p className="mt-2 text-muted">Cargando...</p></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-sm align-middle">
                                    <thead className="table-dark">
                                        <tr><th>ID</th><th>Nombre del rol</th><th>Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtrados.length === 0 ? (
                                            <tr><td colSpan={3} className="text-center text-muted py-3">Sin resultados</td></tr>
                                        ) : filtrados.map((r) => (
                                            <tr key={r.id}>
                                                <td>{r.id}</td>
                                                <td><span className="badge bg-dark fs-6">{r.nombre_rol}</span></td>
                                                <td>
                                                    <button className="btn btn-warning btn-sm me-1" onClick={() => prepararEdicion(r)}>Editar</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(r.id)}>Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------
// Componente principal con tabs
// -----------------------------------------------------------
export default function UsuariosApp() {
    const [tab, setTab] = useState('usuarios');

    return (
        <div>
            <Toaster position="top-right" />
            <Navbar />
            <div className="container mt-4">
                <h4 className="mb-3">Gestion de Usuarios y Roles</h4>
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'usuarios' ? 'active' : ''}`} onClick={() => setTab('usuarios')}>
                            Usuarios
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'roles' ? 'active' : ''}`} onClick={() => setTab('roles')}>
                            Roles
                        </button>
                    </li>
                </ul>
                {tab === 'usuarios' ? <UsuariosPanel /> : <RolesPanel />}
            </div>
        </div>
    );
}
