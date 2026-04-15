import { useState, useEffect } from 'react';
import {
    readPersonajes, createPersonaje, updatePersonaje, deletePersonaje,
    readNodoPersonajes, createNodoPersonaje, updateNodoPersonaje, deleteNodoPersonaje,
    readHistorias, readNodos, readMisImagenes,
} from '../../../services/api';
import Navbar from '../../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';
import ModalAlert from '../../../components/ModalAlert';

// -----------------------------------------------------------
// Panel de Personajes
// -----------------------------------------------------------
function PersonajesPanel() {
    const FORM_INICIAL = { nombre: '', id_historia: '', id_imagen: '' };

    const [personajes, setPersonajes] = useState([]);
    const [historias, setHistorias] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [errores, setErrores] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        cargar();
        Promise.all([readHistorias(), readMisImagenes()]).then(([h, i]) => {
            setHistorias(h.data);
            setImagenes(i.data);
        }).catch(() => toast.error('Error al cargar datos auxiliares'));
    }, []);

    const cargar = async () => {
        setCargando(true);
        try { setPersonajes((await readPersonajes()).data); }
        catch { toast.error('Error al obtener personajes'); }
        finally { setCargando(false); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErrores({});
        const payload = {
            nombre: formData.nombre,
            id_historia: formData.id_historia || null,
            id_imagen: formData.id_imagen || null,
        };
        try {
            if (editandoId) { await updatePersonaje(editandoId, payload); toast.success('Personaje actualizado'); }
            else { await createPersonaje(payload); toast.success('Personaje creado'); }
            setFormData(FORM_INICIAL);
            setEditandoId(null);
            cargar();
        } catch (err) {
            if (err.response?.data) { setErrores(err.response.data); toast.error('Corrige los errores'); }
            else toast.error('Error de conexion');
        } finally { setCargandoGuardar(false); }
    };

    const prepararEdicion = (p) => {
        setFormData({
            nombre: p.nombre,
            id_historia: p.id_historia || '',
            id_imagen: p.id_imagen || '',
        });
        setEditandoId(p.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelar = () => { setFormData(FORM_INICIAL); setEditandoId(null); setErrores({}); };

    const handleEliminar = (id) => setConfirmDelete(id);

    const ejecutarEliminar = async () => {
        const id = confirmDelete;
        setConfirmDelete(null);
        const tid = toast.loading('Eliminando...');
        try { await deletePersonaje(id); toast.success('Personaje eliminado', { id: tid }); cargar(); }
        catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const nombreHistoria = (id) => historias.find((h) => h.id === id)?.titulo || `Historia ${id}`;

    const filtrados = personajes.filter((p) =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase())
    );

    const personajesSubmitLabel = cargandoGuardar
        ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
        : editandoId ? 'Actualizar' : 'Guardar';

    return (
        <div className="row">
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-purple text-white" style={{ backgroundColor: '#6f42c1' }}>
                        <h5 className="mb-0">{editandoId ? 'Editar Personaje' : 'Nuevo Personaje'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="nombre_personaje" className="form-label">Nombre</label>
                                <input id="nombre_personaje" type="text" name="nombre"
                                    className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                                    value={formData.nombre} onChange={handleChange}
                                    required disabled={cargandoGuardar} placeholder="Nombre del personaje" />
                                {errores.nombre && <div className="invalid-feedback">{errores.nombre.join(', ')}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="id_historia_personaje" className="form-label">Historia</label>
                                <select id="id_historia_personaje" name="id_historia"
                                    className={`form-select ${errores.id_historia ? 'is-invalid' : ''}`}
                                    value={formData.id_historia} onChange={handleChange}
                                    required disabled={cargandoGuardar}>
                                    <option value="">-- Selecciona una historia --</option>
                                    {historias.map((h) => (
                                        <option key={h.id} value={h.id}>{h.titulo} (ID: {h.id})</option>
                                    ))}
                                </select>
                                {errores.id_historia && <div className="invalid-feedback">{errores.id_historia.join(', ')}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="id_imagen_personaje" className="form-label">Imagen del personaje (opcional)</label>
                                <select id="id_imagen_personaje" name="id_imagen"
                                    className="form-select"
                                    value={formData.id_imagen} onChange={handleChange}
                                    disabled={cargandoGuardar}>
                                    <option value="">-- Sin imagen --</option>
                                    {imagenes.filter(i => i.tipo === 'personaje').map((i) => (
                                        <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-success" disabled={cargandoGuardar}>
                                    {personajesSubmitLabel}
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
                            <h5 className="mb-0">Lista de Personajes</h5>
                            <input type="text" className="form-control form-control-sm" style={{ maxWidth: 220 }}
                                placeholder="Buscar nombre..." value={filtro}
                                onChange={(e) => setFiltro(e.target.value)} />
                        </div>
                        {cargando ? (
                            <div className="text-center py-5"><div className="spinner-border" style={{ color: '#6f42c1' }} /><p className="mt-2 text-muted">Cargando...</p></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-sm align-middle">
                                    <thead className="table-dark">
                                        <tr><th>ID</th><th>Nombre</th><th>Historia</th><th>Imagen</th><th>Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtrados.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center text-muted py-3">Sin resultados</td></tr>
                                        ) : filtrados.map((p) => (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td>{p.nombre}</td>
                                                <td>{nombreHistoria(p.id_historia)}</td>
                                                <td>{p.id_imagen ? `ID ${p.id_imagen}` : '—'}</td>
                                                <td>
                                                    <button className="btn btn-warning btn-sm me-1" onClick={() => prepararEdicion(p)}>Editar</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(p.id)}>Eliminar</button>
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

            <ModalAlert
                open={!!confirmDelete}
                type="warning"
                title="¿Eliminar personaje?"
                message="Se eliminará este personaje y todas sus asignaciones. Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onClose={(ok) => { if (ok) ejecutarEliminar(); else setConfirmDelete(null); }}
            />
        </div>
    );
}

// -----------------------------------------------------------
// Panel de Nodo-Personajes (tabla pivote)
// -----------------------------------------------------------
function NodoPersonajesPanel() {
    const FORM_INICIAL = { id_nodo: '', id_personaje: '', posicion: 'centro' };

    const [nodoPersonajes, setNodoPersonajes] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [personajes, setPersonajes] = useState([]);
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [errores, setErrores] = useState({});
    const [confirmDeleteNP, setConfirmDeleteNP] = useState(null);

    useEffect(() => {
        cargar();
        Promise.all([readNodos(), readPersonajes()]).then(([n, p]) => {
            setNodos(n.data);
            setPersonajes(p.data);
        }).catch(() => toast.error('Error al cargar nodos/personajes'));
    }, []);

    const cargar = async () => {
        setCargando(true);
        try { setNodoPersonajes((await readNodoPersonajes()).data); }
        catch { toast.error('Error al obtener nodo-personajes'); }
        finally { setCargando(false); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErrores({});
        const payload = {
            id_nodo: formData.id_nodo || null,
            id_personaje: formData.id_personaje || null,
            posicion: formData.posicion,
        };
        try {
            if (editandoId) { await updateNodoPersonaje(editandoId, payload); toast.success('Actualizado'); }
            else { await createNodoPersonaje(payload); toast.success('Asignacion creada'); }
            setFormData(FORM_INICIAL);
            setEditandoId(null);
            cargar();
        } catch (err) {
            if (err.response?.data) { setErrores(err.response.data); toast.error('Corrige los errores'); }
            else toast.error('Error de conexion');
        } finally { setCargandoGuardar(false); }
    };

    const prepararEdicion = (np) => {
        setFormData({
            id_nodo: np.id_nodo || '',
            id_personaje: np.id_personaje || '',
            posicion: np.posicion,
        });
        setEditandoId(np.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelar = () => { setFormData(FORM_INICIAL); setEditandoId(null); setErrores({}); };

    const handleEliminar = (id) => setConfirmDeleteNP(id);

    const ejecutarEliminarNP = async () => {
        const id = confirmDeleteNP;
        setConfirmDeleteNP(null);
        const tid = toast.loading('Eliminando...');
        try { await deleteNodoPersonaje(id); toast.success('Eliminado', { id: tid }); cargar(); }
        catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const nombreNodo = (id) => nodos.find((n) => n.id === id)?.titulo_nodo || `Nodo ${id}`;
    const nombrePersonaje = (id) => personajes.find((p) => p.id === id)?.nombre || `Personaje ${id}`;

    const filtrados = nodoPersonajes.filter((np) =>
        nombreNodo(np.id_nodo).toLowerCase().includes(filtro.toLowerCase()) ||
        nombrePersonaje(np.id_personaje).toLowerCase().includes(filtro.toLowerCase())
    );

    const badgePosicion = { izquierda: 'bg-primary', centro: 'bg-success', derecha: 'bg-warning text-dark' };

    const npSubmitLabel = cargandoGuardar
        ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
        : editandoId ? 'Actualizar' : 'Asignar';

    return (
        <div className="row">
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header text-white" style={{ backgroundColor: '#6f42c1' }}>
                        <h5 className="mb-0">{editandoId ? 'Editar Asignacion' : 'Asignar Personaje a Nodo'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="id_nodo_np" className="form-label">Nodo</label>
                                <select id="id_nodo_np" name="id_nodo"
                                    className={`form-select ${errores.id_nodo ? 'is-invalid' : ''}`}
                                    value={formData.id_nodo} onChange={handleChange}
                                    required disabled={cargandoGuardar}>
                                    <option value="">-- Selecciona un nodo --</option>
                                    {nodos.map((n) => (
                                        <option key={n.id} value={n.id}>{n.titulo_nodo} (ID: {n.id})</option>
                                    ))}
                                </select>
                                {errores.id_nodo && <div className="invalid-feedback">{errores.id_nodo.join(', ')}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="id_personaje_np" className="form-label">Personaje</label>
                                <select id="id_personaje_np" name="id_personaje"
                                    className={`form-select ${errores.id_personaje ? 'is-invalid' : ''}`}
                                    value={formData.id_personaje} onChange={handleChange}
                                    required disabled={cargandoGuardar}>
                                    <option value="">-- Selecciona un personaje --</option>
                                    {personajes.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nombre} (ID: {p.id})</option>
                                    ))}
                                </select>
                                {errores.id_personaje && <div className="invalid-feedback">{errores.id_personaje.join(', ')}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="posicion_np" className="form-label">Posicion en pantalla</label>
                                <select id="posicion_np" name="posicion"
                                    className="form-select"
                                    value={formData.posicion} onChange={handleChange}
                                    disabled={cargandoGuardar}>
                                    <option value="izquierda">Izquierda</option>
                                    <option value="centro">Centro</option>
                                    <option value="derecha">Derecha</option>
                                </select>
                            </div>

                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-success" disabled={cargandoGuardar}>
                                    {npSubmitLabel}
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
                            <h5 className="mb-0">Personajes por Nodo</h5>
                            <input type="text" className="form-control form-control-sm" style={{ maxWidth: 220 }}
                                placeholder="Buscar nodo o personaje..." value={filtro}
                                onChange={(e) => setFiltro(e.target.value)} />
                        </div>
                        {cargando ? (
                            <div className="text-center py-5"><div className="spinner-border" style={{ color: '#6f42c1' }} /><p className="mt-2 text-muted">Cargando...</p></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-sm align-middle">
                                    <thead className="table-dark">
                                        <tr><th>ID</th><th>Nodo</th><th>Personaje</th><th>Posicion</th><th>Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtrados.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center text-muted py-3">Sin resultados</td></tr>
                                        ) : filtrados.map((np) => (
                                            <tr key={np.id}>
                                                <td>{np.id}</td>
                                                <td>{nombreNodo(np.id_nodo)}</td>
                                                <td>{nombrePersonaje(np.id_personaje)}</td>
                                                <td>
                                                    <span className={`badge ${badgePosicion[np.posicion] || 'bg-secondary'}`}>
                                                        {np.posicion}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-warning btn-sm me-1" onClick={() => prepararEdicion(np)}>Editar</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(np.id)}>Eliminar</button>
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

            <ModalAlert
                open={!!confirmDeleteNP}
                type="warning"
                title="¿Eliminar asignación?"
                message="Se eliminará esta asignación de personaje-nodo. Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onClose={(ok) => { if (ok) ejecutarEliminarNP(); else setConfirmDeleteNP(null); }}
            />
        </div>
    );
}

// -----------------------------------------------------------
// Componente principal con tabs
// -----------------------------------------------------------
export default function PersonajesApp() {
    const [tab, setTab] = useState('personajes');

    return (
        <div>
            <Toaster position="top-right" />
            <Navbar />
            <div className="container mt-4">
                <h4 className="mb-3">Gestion de Personajes</h4>
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'personajes' ? 'active' : ''}`} onClick={() => setTab('personajes')}>
                            Personajes
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'asignaciones' ? 'active' : ''}`} onClick={() => setTab('asignaciones')}>
                            Asignacion a Nodos
                        </button>
                    </li>
                </ul>
                {tab === 'personajes' ? <PersonajesPanel /> : <NodoPersonajesPanel />}
            </div>
        </div>
    );
}
