import { useState, useEffect } from 'react';
import {
    readHistorias, createHistoria, updateHistoria, deleteHistoria,
    readUsuarios, readNodos,
} from '../../../services/api';
import Navbar from '../../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';

const FORM_INICIAL = {
    titulo: '',
    descripcion: '',
    publicada: false,
    id_creador: '',
    id_nodo_inicio: '',
};

export default function HistoriasApp() {
    const [historias, setHistorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        cargarHistorias();
        cargarUsuarios();
        cargarNodos();
    }, []);

    const cargarHistorias = async () => {
        setCargando(true);
        try {
            const res = await readHistorias();
            setHistorias(res.data);
        } catch {
            toast.error('Error al obtener historias');
        } finally {
            setCargando(false);
        }
    };

    const cargarUsuarios = async () => {
        try { setUsuarios((await readUsuarios()).data); } catch { /* silencioso */ }
    };

    const cargarNodos = async () => {
        try { setNodos((await readNodos()).data); } catch { /* silencioso */ }
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
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            publicada: formData.publicada,
            id_creador: formData.id_creador || null,
            id_nodo_inicio: formData.id_nodo_inicio || null,
        };
        try {
            if (editandoId) {
                await updateHistoria(editandoId, payload);
                toast.success('Historia actualizada');
            } else {
                await createHistoria(payload);
                toast.success('Historia creada');
            }
            setFormData(FORM_INICIAL);
            setEditandoId(null);
            cargarHistorias();
        } catch (err) {
            if (err.response?.data) {
                setErrores(err.response.data);
                toast.error('Corrige los errores del formulario');
            } else {
                toast.error('Error de conexion con el servidor');
            }
        } finally {
            setCargandoGuardar(false);
        }
    };

    const prepararEdicion = (h) => {
        setFormData({
            titulo: h.titulo,
            descripcion: h.descripcion,
            publicada: h.publicada,
            id_creador: h.id_creador || '',
            id_nodo_inicio: h.id_nodo_inicio || '',
        });
        setEditandoId(h.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelar = () => {
        setFormData(FORM_INICIAL);
        setEditandoId(null);
        setErrores({});
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('Seguro que deseas eliminar esta historia?')) return;
        const tid = toast.loading('Eliminando...');
        try {
            await deleteHistoria(id);
            toast.success('Historia eliminada', { id: tid });
            cargarHistorias();
        } catch {
            toast.error('Error al eliminar', { id: tid });
        }
    };

    const historiasFiltradas = historias.filter((h) =>
        h.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        (h.publicada ? 'publicada' : 'borrador').includes(filtro.toLowerCase())
    );

    return (
        <div>
            <Toaster position="top-right" />
            <Navbar />

            <div className="container mt-4">
                <div className="row">
                    {/* Formulario */}
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">{editandoId ? 'Editar Historia' : 'Nueva Historia'}</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Titulo</label>
                                        <input
                                            type="text" name="titulo"
                                            className={`form-control ${errores.titulo ? 'is-invalid' : ''}`}
                                            value={formData.titulo} onChange={handleChange}
                                            required disabled={cargandoGuardar}
                                            placeholder="Titulo de la historia"
                                        />
                                        {errores.titulo && <div className="invalid-feedback">{errores.titulo.join(', ')}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Descripcion</label>
                                        <textarea
                                            name="descripcion" rows="3"
                                            className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
                                            value={formData.descripcion} onChange={handleChange}
                                            disabled={cargandoGuardar} placeholder="Sinopsis"
                                        />
                                        {errores.descripcion && <div className="invalid-feedback">{errores.descripcion.join(', ')}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Creador</label>
                                        <select
                                            name="id_creador"
                                            className={`form-select ${errores.id_creador ? 'is-invalid' : ''}`}
                                            value={formData.id_creador} onChange={handleChange}
                                            required disabled={cargandoGuardar}
                                        >
                                            <option value="">-- Selecciona un usuario --</option>
                                            {usuarios.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.nombre} {u.apellido_paterno} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                        {errores.id_creador && <div className="invalid-feedback">{errores.id_creador.join(', ')}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Nodo de inicio (opcional)</label>
                                        <select
                                            name="id_nodo_inicio"
                                            className={`form-select ${errores.id_nodo_inicio ? 'is-invalid' : ''}`}
                                            value={formData.id_nodo_inicio} onChange={handleChange}
                                            disabled={cargandoGuardar}
                                        >
                                            <option value="">-- Sin nodo de inicio --</option>
                                            {nodos.map((n) => (
                                                <option key={n.id} value={n.id}>
                                                    {n.titulo_nodo} (ID: {n.id})
                                                </option>
                                            ))}
                                        </select>
                                        {errores.id_nodo_inicio && <div className="invalid-feedback">{errores.id_nodo_inicio.join(', ')}</div>}
                                    </div>

                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox" name="publicada" id="publicada"
                                            className="form-check-input"
                                            checked={formData.publicada} onChange={handleChange}
                                            disabled={cargandoGuardar}
                                        />
                                        <label className="form-check-label" htmlFor="publicada">Publicada</label>
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
                                    <h5 className="mb-0">Lista de Historias</h5>
                                    <input
                                        type="text" className="form-control form-control-sm"
                                        style={{ maxWidth: 220 }}
                                        placeholder="Buscar titulo o estado..."
                                        value={filtro} onChange={(e) => setFiltro(e.target.value)}
                                    />
                                </div>

                                {cargando ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" />
                                        <p className="mt-2 text-muted">Cargando...</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover table-sm align-middle">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Titulo</th>
                                                    <th>Estado</th>
                                                    <th>Creador</th>
                                                    <th>Fecha</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historiasFiltradas.length === 0 ? (
                                                    <tr><td colSpan={6} className="text-center text-muted py-3">Sin resultados</td></tr>
                                                ) : historiasFiltradas.map((h) => (
                                                    <tr key={h.id}>
                                                        <td>{h.id}</td>
                                                        <td>{h.titulo}</td>
                                                        <td>
                                                            {h.publicada
                                                                ? <span className="badge bg-success">Publicada</span>
                                                                : <span className="badge bg-secondary">Borrador</span>}
                                                        </td>
                                                        <td>{h.id_creador}</td>
                                                        <td>{new Date(h.fecha_creacion).toLocaleDateString('es-MX')}</td>
                                                        <td>
                                                            <button className="btn btn-warning btn-sm me-1" onClick={() => prepararEdicion(h)}>Editar</button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(h.id)}>Eliminar</button>
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
            </div>
        </div>
    );
}
