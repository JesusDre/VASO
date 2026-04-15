import { useState, useEffect } from 'react';
import {
    API_BASE,
    readMisImagenes, createMiImagen, updateImagen, deleteMiImagen,
    readMisAudios, createMiAudio, updateAudio, deleteMiAudio,
} from '../../../services/api';
import Navbar from '../../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';
import ModalAlert from '../../../components/ModalAlert';

// -----------------------------------------------------------
// Panel de Imagenes
// -----------------------------------------------------------
function ImagenesPanel() {
    const FORM_INICIAL = { tipo: 'escenario', descripcion: '', url: null, imagen_para_binario: null };

    const [imagenes, setImagenes] = useState([]);
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [errores, setErrores] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try { setImagenes((await readMisImagenes()).data); }
        catch { toast.error('Error al obtener imagenes'); }
        finally { setCargando(false); }
    };

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErrores({});
        const data = new FormData();
        data.append('tipo', formData.tipo);
        data.append('descripcion', formData.descripcion);
        if (formData.url instanceof File) data.append('url', formData.url);
        if (formData.imagen_para_binario instanceof File) data.append('imagen_para_binario', formData.imagen_para_binario);
        try {
            if (editandoId) {
                await updateImagen(editandoId, data);
                toast.success('Imagen actualizada');
            } else {
                await createMiImagen(data);
                toast.success('Imagen creada');
            }
            setFormData(FORM_INICIAL);
            setEditandoId(null);
            cargar();
        } catch (err) {
            if (err.response?.data) { setErrores(err.response.data); toast.error('Corrige los errores'); }
            else toast.error('Error de conexion');
        } finally { setCargandoGuardar(false); }
    };

    const prepararEdicion = (img) => {
        setFormData({ tipo: img.tipo, descripcion: img.descripcion, url: null, imagen_para_binario: null });
        setEditandoId(img.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelar = () => { setFormData(FORM_INICIAL); setEditandoId(null); setErrores({}); };

    const handleEliminar = (id) => setConfirmDelete(id);

    const ejecutarEliminar = async () => {
        const id = confirmDelete;
        setConfirmDelete(null);
        const tid = toast.loading('Eliminando...');
        try { await deleteMiImagen(id); toast.success('Imagen eliminada', { id: tid }); cargar(); }
        catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const imgBase = (url) => url?.startsWith('http') ? url : `${API_BASE}${url}`;

    const filtradas = imagenes.filter((img) =>
        img.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
        (img.descripcion || '').toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="row">
            {/* Formulario */}
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">{editandoId ? 'Editar Imagen' : 'Nueva Imagen'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Tipo</label>
                                <select name="tipo" className={`form-select ${errores.tipo ? 'is-invalid' : ''}`}
                                    value={formData.tipo} onChange={handleChange} required disabled={cargandoGuardar}>
                                    <option value="escenario">Escenario</option>
                                    <option value="personaje">Personaje</option>
                                    <option value="portada">Portada</option>
                                </select>
                                {errores.tipo && <div className="invalid-feedback">{errores.tipo.join(', ')}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Descripcion</label>
                                <input type="text" name="descripcion"
                                    className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
                                    value={formData.descripcion} onChange={handleChange}
                                    disabled={cargandoGuardar} placeholder="Descripcion de la imagen" />
                                {errores.descripcion && <div className="invalid-feedback">{errores.descripcion.join(', ')}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Imagen (archivo en servidor)</label>
                                <input type="file" name="url"
                                    className={`form-control ${errores.url ? 'is-invalid' : ''}`}
                                    onChange={handleChange} accept="image/*" disabled={cargandoGuardar} />
                                {errores.url && <div className="invalid-feedback">{errores.url.join(', ')}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Imagen binaria (en BD)</label>
                                <input type="file" name="imagen_para_binario"
                                    className={`form-control ${errores.imagen_para_binario ? 'is-invalid' : ''}`}
                                    onChange={handleChange} accept="image/*" disabled={cargandoGuardar} />
                                {errores.imagen_para_binario && <div className="invalid-feedback">{errores.imagen_para_binario.join(', ')}</div>}
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

            {/* Tabla */}
            <div className="col-md-8">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Lista de Imagenes</h5>
                            <input type="text" className="form-control form-control-sm" style={{ maxWidth: 220 }}
                                placeholder="Buscar tipo o descripcion..." value={filtro}
                                onChange={(e) => setFiltro(e.target.value)} />
                        </div>
                        {cargando ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary" /><p className="mt-2 text-muted">Cargando...</p></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-sm align-middle">
                                    <thead className="table-dark">
                                        <tr><th>ID</th><th>Tipo</th><th>Descripcion</th><th>Preview</th><th>Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtradas.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center text-muted py-3">Sin resultados</td></tr>
                                        ) : filtradas.map((img) => (
                                            <tr key={img.id}>
                                                <td>{img.id}</td>
                                                <td><span className="badge bg-info text-dark">{img.tipo}</span></td>
                                                <td>{img.descripcion || '—'}</td>
                                                <td>
                                                    {img.url ? (
                                                        <img src={imgBase(img.url)} alt={img.descripcion}
                                                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                                                    ) : img.imagen_base64_display ? (
                                                        <img src={`data:image/jpeg;base64,${img.imagen_base64_display}`} alt=""
                                                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                                                    ) : <span className="text-muted">—</span>}
                                                </td>
                                                <td>
                                                    <button className="btn btn-warning btn-sm me-1" onClick={() => prepararEdicion(img)}>Editar</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(img.id)}>Eliminar</button>
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
                title="¿Eliminar imagen?"
                message="Se eliminará esta imagen permanentemente. Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onClose={(ok) => { if (ok) ejecutarEliminar(); else setConfirmDelete(null); }}
            />
        </div>
    );
}

// -----------------------------------------------------------
// Panel de Audios
// -----------------------------------------------------------
function AudiosPanel() {
    const FORM_INICIAL = { descripcion: '', archivo: null };

    const [audios, setAudios] = useState([]);
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [errores, setErrores] = useState({});
    const [confirmDeleteAudio, setConfirmDeleteAudio] = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try { setAudios((await readMisAudios()).data); }
        catch { toast.error('Error al obtener audios'); }
        finally { setCargando(false); }
    };

    const handleChange = (e) => {
        if (e.target.type === 'file') setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        else setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargandoGuardar(true);
        setErrores({});
        const data = new FormData();
        data.append('descripcion', formData.descripcion);
        if (formData.archivo instanceof File) data.append('archivo', formData.archivo);
        try {
            if (editandoId) { await updateAudio(editandoId, data); toast.success('Audio actualizado'); }
            else { await createMiAudio(data); toast.success('Audio creado'); }
            setFormData(FORM_INICIAL);
            setEditandoId(null);
            cargar();
        } catch (err) {
            if (err.response?.data) { setErrores(err.response.data); toast.error('Corrige los errores'); }
            else toast.error('Error de conexion');
        } finally { setCargandoGuardar(false); }
    };

    const prepararEdicion = (a) => {
        setFormData({ descripcion: a.descripcion, archivo: null });
        setEditandoId(a.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelar = () => { setFormData(FORM_INICIAL); setEditandoId(null); setErrores({}); };

    const handleEliminar = (id) => setConfirmDeleteAudio(id);

    const ejecutarEliminarAudio = async () => {
        const id = confirmDeleteAudio;
        setConfirmDeleteAudio(null);
        const tid = toast.loading('Eliminando...');
        try { await deleteMiAudio(id); toast.success('Audio eliminado', { id: tid }); cargar(); }
        catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const audioBase = (url) => url?.startsWith('http') ? url : `${API_BASE}${url}`;

    const filtrados = audios.filter((a) =>
        (a.descripcion || '').toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="row">
            {/* Formulario */}
            <div className="col-md-4 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0">{editandoId ? 'Editar Audio' : 'Nuevo Audio'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Descripcion</label>
                                <input type="text" name="descripcion"
                                    className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
                                    value={formData.descripcion} onChange={handleChange}
                                    disabled={cargandoGuardar} placeholder="Nombre del audio" />
                                {errores.descripcion && <div className="invalid-feedback">{errores.descripcion.join(', ')}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Archivo de audio</label>
                                <input type="file" name="archivo"
                                    className={`form-control ${errores.archivo ? 'is-invalid' : ''}`}
                                    onChange={handleChange} accept="audio/*" disabled={cargandoGuardar} />
                                {errores.archivo && <div className="invalid-feedback">{errores.archivo.join(', ')}</div>}
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

            {/* Tabla */}
            <div className="col-md-8">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Lista de Audios</h5>
                            <input type="text" className="form-control form-control-sm" style={{ maxWidth: 220 }}
                                placeholder="Buscar descripcion..." value={filtro}
                                onChange={(e) => setFiltro(e.target.value)} />
                        </div>
                        {cargando ? (
                            <div className="text-center py-5"><div className="spinner-border text-warning" /><p className="mt-2 text-muted">Cargando...</p></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-sm align-middle">
                                    <thead className="table-dark">
                                        <tr><th>ID</th><th>Descripcion</th><th>Reproducir</th><th>Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtrados.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center text-muted py-3">Sin resultados</td></tr>
                                        ) : filtrados.map((a) => (
                                            <tr key={a.id}>
                                                <td>{a.id}</td>
                                                <td>{a.descripcion || '—'}</td>
                                                <td>
                                                    {a.archivo ? (
                                                        <audio controls style={{ height: 32 }}>
                                                            <source src={audioBase(a.archivo)} />
                                                        </audio>
                                                    ) : <span className="text-muted">—</span>}
                                                </td>
                                                <td>
                                                    <button className="btn btn-warning btn-sm me-1" onClick={() => prepararEdicion(a)}>Editar</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(a.id)}>Eliminar</button>
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
                open={!!confirmDeleteAudio}
                type="warning"
                title="¿Eliminar audio?"
                message="Se eliminará este audio permanentemente. Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onClose={(ok) => { if (ok) ejecutarEliminarAudio(); else setConfirmDeleteAudio(null); }}
            />
        </div>
    );
}

// -----------------------------------------------------------
// Componente principal con tabs
// -----------------------------------------------------------
export default function RecursosApp() {
    const [tab, setTab] = useState('imagenes');

    return (
        <div>
            <Toaster position="top-right" />
            <Navbar />
            <div className="container mt-4">
                <h4 className="mb-3">Gestion de Recursos Multimedia</h4>
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'imagenes' ? 'active' : ''}`} onClick={() => setTab('imagenes')}>
                            Imagenes
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'audios' ? 'active' : ''}`} onClick={() => setTab('audios')}>
                            Audios
                        </button>
                    </li>
                </ul>
                {tab === 'imagenes' ? <ImagenesPanel /> : <AudiosPanel />}
            </div>
        </div>
    );
}
