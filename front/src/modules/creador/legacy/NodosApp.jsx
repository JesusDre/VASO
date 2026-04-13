import { useState, useEffect } from 'react';
import {
    readNodos, createNodo, updateNodo, deleteNodo,
    readOpciones, createOpcion, updateOpcion, deleteOpcion,
    readHistorias, readImagenes, readAudios,
} from '../../../services/api';
import Navbar from '../../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';

// -----------------------------------------------------------
// Panel de Nodos
// -----------------------------------------------------------
function NodosPanel() {
    const FORM_INICIAL = {
        titulo_nodo: '', texto: '', es_final: false,
        id_historia: '', id_imagen_escenario: '', id_audio_fondo: '',
    };

    const [nodos, setNodos] = useState([]);
    const [historias, setHistorias] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [audios, setAudios] = useState([]);
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        cargar();
        Promise.all([readHistorias(), readImagenes(), readAudios()]).then(([h, i, a]) => {
            setHistorias(h.data);
            setImagenes(i.data);
            setAudios(a.data);
        }).catch(() => {});
    }, []);

    const cargar = async () => {
        setCargando(true);
        try { setNodos((await readNodos()).data); }
        catch { toast.error('Error al obtener nodos'); }
        finally { setCargando(false); }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErrores({});
        const payload = {
            titulo_nodo: formData.titulo_nodo,
            texto: formData.texto,
            es_final: formData.es_final,
            id_historia: formData.id_historia || null,
            id_imagen_escenario: formData.id_imagen_escenario || null,
            id_audio_fondo: formData.id_audio_fondo || null,
        };
        try {
            if (editandoId) { await updateNodo(editandoId, payload); toast.success('Nodo actualizado'); }
            else { await createNodo(payload); toast.success('Nodo creado'); }
            setFormData(FORM_INICIAL);
            setEditandoId(null);
            cargar();
        } catch (err) {
            if (err.response?.data) { setErrores(err.response.data); toast.error('Corrige los errores'); }
            else toast.error('Error de conexion');
        } finally { setCargandoGuardar(false); }
    };

    const prepararEdicion = (n) => {
        setFormData({
            titulo_nodo: n.titulo_nodo,
            texto: n.texto,
            es_final: n.es_final,
            id_historia: n.id_historia || '',
            id_imagen_escenario: n.id_imagen_escenario || '',
            id_audio_fondo: n.id_audio_fondo || '',
        });
        setEditandoId(n.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelar = () => { setFormData(FORM_INICIAL); setEditandoId(null); setErrores({}); };

    const handleEliminar = async (id) => {
        if (!window.confirm('Eliminar este nodo?')) return;
        const tid = toast.loading('Eliminando...');
        try { await deleteNodo(id); toast.success('Nodo eliminado', { id: tid }); cargar(); }
        catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const filtrados = nodos.filter((n) =>
        n.titulo_nodo.toLowerCase().includes(filtro.toLowerCase()) ||
        n.texto.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="row">
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">{editandoId ? 'Editar Nodo' : 'Nuevo Nodo'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Titulo del nodo</label>
                                <input type="text" name="titulo_nodo"
                                    className={`form-control ${errores.titulo_nodo ? 'is-invalid' : ''}`}
                                    value={formData.titulo_nodo} onChange={handleChange}
                                    required disabled={cargandoGuardar} placeholder="Nombre interno del nodo" />
                                {errores.titulo_nodo && <div className="invalid-feedback">{errores.titulo_nodo.join(', ')}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Texto narrativo</label>
                                <textarea name="texto" rows="4"
                                    className={`form-control ${errores.texto ? 'is-invalid' : ''}`}
                                    value={formData.texto} onChange={handleChange}
                                    required disabled={cargandoGuardar} placeholder="Texto que vera el jugador" />
                                {errores.texto && <div className="invalid-feedback">{errores.texto.join(', ')}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Historia</label>
                                <select name="id_historia"
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
                                <label className="form-label">Imagen de escenario (opcional)</label>
                                <select name="id_imagen_escenario"
                                    className="form-select"
                                    value={formData.id_imagen_escenario} onChange={handleChange}
                                    disabled={cargandoGuardar}>
                                    <option value="">-- Sin imagen --</option>
                                    {imagenes.filter(i => i.tipo === 'escenario').map((i) => (
                                        <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Audio de fondo (opcional)</label>
                                <select name="id_audio_fondo"
                                    className="form-select"
                                    value={formData.id_audio_fondo} onChange={handleChange}
                                    disabled={cargandoGuardar}>
                                    <option value="">-- Sin audio --</option>
                                    {audios.map((a) => (
                                        <option key={a.id} value={a.id}>{a.descripcion || `Audio ${a.id}`}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3 form-check">
                                <input type="checkbox" name="es_final" id="es_final"
                                    className="form-check-input"
                                    checked={formData.es_final} onChange={handleChange}
                                    disabled={cargandoGuardar} />
                                <label className="form-check-label" htmlFor="es_final">Es nodo final</label>
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
                            <h5 className="mb-0">Lista de Nodos</h5>
                            <input type="text" className="form-control form-control-sm" style={{ maxWidth: 220 }}
                                placeholder="Buscar titulo o texto..." value={filtro}
                                onChange={(e) => setFiltro(e.target.value)} />
                        </div>
                        {cargando ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary" /><p className="mt-2 text-muted">Cargando...</p></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-sm align-middle">
                                    <thead className="table-dark">
                                        <tr><th>ID</th><th>Titulo</th><th>Historia</th><th>Final</th><th>Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtrados.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center text-muted py-3">Sin resultados</td></tr>
                                        ) : filtrados.map((n) => (
                                            <tr key={n.id}>
                                                <td>{n.id}</td>
                                                <td>{n.titulo_nodo}</td>
                                                <td>{n.id_historia}</td>
                                                <td>
                                                    {n.es_final
                                                        ? <span className="badge bg-danger">Final</span>
                                                        : <span className="badge bg-light text-dark">No</span>}
                                                </td>
                                                <td>
                                                    <button className="btn btn-warning btn-sm me-1" onClick={() => prepararEdicion(n)}>Editar</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(n.id)}>Eliminar</button>
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
// Panel de Opciones
// -----------------------------------------------------------
function OpcionesPanel() {
    const FORM_INICIAL = { texto_opcion: '', id_nodo_origen: '', id_nodo_destino: '' };

    const [opciones, setOpciones] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        cargar();
        readNodos().then((r) => setNodos(r.data)).catch(() => {});
    }, []);

    const cargar = async () => {
        setCargando(true);
        try { setOpciones((await readOpciones()).data); }
        catch { toast.error('Error al obtener opciones'); }
        finally { setCargando(false); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErrores({});
        const payload = {
            texto_opcion: formData.texto_opcion,
            id_nodo_origen: formData.id_nodo_origen || null,
            id_nodo_destino: formData.id_nodo_destino || null,
        };
        try {
            if (editandoId) { await updateOpcion(editandoId, payload); toast.success('Opcion actualizada'); }
            else { await createOpcion(payload); toast.success('Opcion creada'); }
            setFormData(FORM_INICIAL);
            setEditandoId(null);
            cargar();
        } catch (err) {
            if (err.response?.data) { setErrores(err.response.data); toast.error('Corrige los errores'); }
            else toast.error('Error de conexion');
        } finally { setCargandoGuardar(false); }
    };

    const prepararEdicion = (o) => {
        setFormData({
            texto_opcion: o.texto_opcion,
            id_nodo_origen: o.id_nodo_origen || '',
            id_nodo_destino: o.id_nodo_destino || '',
        });
        setEditandoId(o.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelar = () => { setFormData(FORM_INICIAL); setEditandoId(null); setErrores({}); };

    const handleEliminar = async (id) => {
        if (!window.confirm('Eliminar esta opcion?')) return;
        const tid = toast.loading('Eliminando...');
        try { await deleteOpcion(id); toast.success('Opcion eliminada', { id: tid }); cargar(); }
        catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const nombreNodo = (id) => nodos.find((n) => n.id === id)?.titulo_nodo || `Nodo ${id}`;

    const filtrados = opciones.filter((o) =>
        o.texto_opcion.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="row">
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0">{editandoId ? 'Editar Opcion' : 'Nueva Opcion'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Texto de la opcion</label>
                                <input type="text" name="texto_opcion"
                                    className={`form-control ${errores.texto_opcion ? 'is-invalid' : ''}`}
                                    value={formData.texto_opcion} onChange={handleChange}
                                    required disabled={cargandoGuardar} placeholder="Lo que ve el jugador" />
                                {errores.texto_opcion && <div className="invalid-feedback">{errores.texto_opcion.join(', ')}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Nodo origen</label>
                                <select name="id_nodo_origen"
                                    className={`form-select ${errores.id_nodo_origen ? 'is-invalid' : ''}`}
                                    value={formData.id_nodo_origen} onChange={handleChange}
                                    required disabled={cargandoGuardar}>
                                    <option value="">-- Selecciona nodo origen --</option>
                                    {nodos.map((n) => (
                                        <option key={n.id} value={n.id}>{n.titulo_nodo} (ID: {n.id})</option>
                                    ))}
                                </select>
                                {errores.id_nodo_origen && <div className="invalid-feedback">{errores.id_nodo_origen.join(', ')}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Nodo destino</label>
                                <select name="id_nodo_destino"
                                    className={`form-select ${errores.id_nodo_destino ? 'is-invalid' : ''}`}
                                    value={formData.id_nodo_destino} onChange={handleChange}
                                    required disabled={cargandoGuardar}>
                                    <option value="">-- Selecciona nodo destino --</option>
                                    {nodos.map((n) => (
                                        <option key={n.id} value={n.id}>{n.titulo_nodo} (ID: {n.id})</option>
                                    ))}
                                </select>
                                {errores.id_nodo_destino && <div className="invalid-feedback">{errores.id_nodo_destino.join(', ')}</div>}
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
                            <h5 className="mb-0">Lista de Opciones</h5>
                            <input type="text" className="form-control form-control-sm" style={{ maxWidth: 220 }}
                                placeholder="Buscar texto..." value={filtro}
                                onChange={(e) => setFiltro(e.target.value)} />
                        </div>
                        {cargando ? (
                            <div className="text-center py-5"><div className="spinner-border text-info" /><p className="mt-2 text-muted">Cargando...</p></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-sm align-middle">
                                    <thead className="table-dark">
                                        <tr><th>ID</th><th>Texto</th><th>Origen</th><th>Destino</th><th>Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtrados.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center text-muted py-3">Sin resultados</td></tr>
                                        ) : filtrados.map((o) => (
                                            <tr key={o.id}>
                                                <td>{o.id}</td>
                                                <td>{o.texto_opcion}</td>
                                                <td><span className="badge bg-secondary">{nombreNodo(o.id_nodo_origen)}</span></td>
                                                <td><span className="badge bg-primary">{nombreNodo(o.id_nodo_destino)}</span></td>
                                                <td>
                                                    <button className="btn btn-warning btn-sm me-1" onClick={() => prepararEdicion(o)}>Editar</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(o.id)}>Eliminar</button>
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
export default function NodosApp() {
    const [tab, setTab] = useState('nodos');

    return (
        <div>
            <Toaster position="top-right" />
            <Navbar />
            <div className="container mt-4">
                <h4 className="mb-3">Gestion de Nodos y Opciones</h4>
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'nodos' ? 'active' : ''}`} onClick={() => setTab('nodos')}>
                            Nodos
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'opciones' ? 'active' : ''}`} onClick={() => setTab('opciones')}>
                            Opciones
                        </button>
                    </li>
                </ul>
                {tab === 'nodos' ? <NodosPanel /> : <OpcionesPanel />}
            </div>
        </div>
    );
}
