import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    readPersonajes, createPersonaje, updatePersonaje, deletePersonaje,
    readMisImagenes, readNodos, readNodoPersonajes,
    createNodoPersonaje, deleteNodoPersonaje,
} from '../../../../services/api';
import { inputStyle, labelStyle, selectStyle, btnPrimary, btnGhost, cardStyle } from '../styles/editorStyles';

export default function TabPersonajes({ historiaId }) {
    const FORM_P = { nombre: '', id_imagen: '' };
    const [personajes, setPersonajes] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [nodoPersonajes, setNodoPersonajes] = useState([]);
    const [form, setForm] = useState(FORM_P);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [asignForm, setAsignForm] = useState({ id_personaje: '', id_nodo: '', posicion: 'centro' });
    const [asignando, setAsignando] = useState(false);

    const cargar = async () => {
        const [rp, ri, rn, rnp] = await Promise.all([readPersonajes(), readMisImagenes(), readNodos(), readNodoPersonajes()]);
        setPersonajes(rp.data.filter((p) => Number(p.id_historia) === Number(historiaId)));
        setImagenes(ri.data.filter((i) => i.tipo === 'personaje'));
        setNodos(rn.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
        setNodoPersonajes(rnp.data);
    };

    useEffect(() => { cargar(); }, [historiaId]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        const payload = { nombre: form.nombre, id_historia: Number(historiaId), id_imagen: form.id_imagen || null };
        try {
            if (editandoId) { await updatePersonaje(editandoId, payload); toast.success('Personaje actualizado'); }
            else { await createPersonaje(payload); toast.success('Personaje creado'); }
            setForm(FORM_P); setEditandoId(null); cargar();
        } catch { toast.error('Error al guardar personaje'); }
        finally { setGuardando(false); }
    };

    const eliminarPersonaje = async (id) => {
        if (!window.confirm('¿Eliminar personaje?')) return;
        await deletePersonaje(id); toast.success('Personaje eliminado'); cargar();
    };

    const editar = (p) => { setForm({ nombre: p.nombre, id_imagen: p.id_imagen || '' }); setEditandoId(p.id); };

    const handleAsign = async (e) => {
        e.preventDefault(); setAsignando(true);
        try {
            await createNodoPersonaje({ id_nodo: Number(asignForm.id_nodo), id_personaje: Number(asignForm.id_personaje), posicion: asignForm.posicion });
            toast.success('Personaje asignado al nodo');
            setAsignForm({ id_personaje: '', id_nodo: '', posicion: 'centro' }); cargar();
        } catch { toast.error('Ya existe esa asignación o hubo un error'); }
        finally { setAsignando(false); }
    };

    const eliminarAsignacion = async (id) => { await deleteNodoPersonaje(id); toast.success('Asignación eliminada'); cargar(); };
    const getNombreNodo = (id) => nodos.find((n) => n.id === id)?.titulo_nodo || `N${id}`;
    const getImgSrc = (p) => {
        const img = imagenes.find((i) => i.id === p.id_imagen);
        if (!img) return null;
        if (img.imagen_base64_display) return `data:image/png;base64,${img.imagen_base64_display}`;
        if (img.url) return `http://localhost:8000${img.url}`;
        return null;
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={cardStyle}>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontSize: '0.95rem' }}>{editandoId ? 'Editar personaje' : 'Nuevo personaje'}</h6>
                    <form onSubmit={handleGuardar}>
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>Nombre</label>
                            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Ej: Aria" />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Sprite (imagen de personaje)</label>
                            <select name="id_imagen" value={form.id_imagen} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin sprite --</option>
                                {imagenes.map((i) => <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" disabled={guardando} style={{ ...btnPrimary, flex: 1 }}>{guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}</button>
                            {editandoId && <button type="button" onClick={() => { setForm(FORM_P); setEditandoId(null); }} style={btnGhost}>Cancelar</button>}
                        </div>
                    </form>
                </div>

                {personajes.length > 0 && nodos.length > 0 && (
                    <div style={cardStyle}>
                        <h6 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 16, fontSize: '0.95rem' }}>Asignar a nodo</h6>
                        <form onSubmit={handleAsign}>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Personaje</label>
                                <select value={asignForm.id_personaje} onChange={(e) => setAsignForm({ ...asignForm, id_personaje: e.target.value })} required style={selectStyle}>
                                    <option value="">-- Personaje --</option>
                                    {personajes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Nodo</label>
                                <select value={asignForm.id_nodo} onChange={(e) => setAsignForm({ ...asignForm, id_nodo: e.target.value })} required style={selectStyle}>
                                    <option value="">-- Nodo --</option>
                                    {nodos.map((n) => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Posición en pantalla</label>
                                <select value={asignForm.posicion} onChange={(e) => setAsignForm({ ...asignForm, posicion: e.target.value })} style={selectStyle}>
                                    <option value="izquierda">Izquierda</option>
                                    <option value="centro">Centro</option>
                                    <option value="derecha">Derecha</option>
                                </select>
                            </div>
                            <button type="submit" disabled={asignando} style={{ ...btnPrimary, width: '100%' }}>{asignando ? '...' : 'Asignar'}</button>
                        </form>
                    </div>
                )}
            </div>

            <div>
                {personajes.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>Sin personajes. Crea el primero.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {personajes.map((p) => {
                            const src = getImgSrc(p);
                            const asignaciones = nodoPersonajes.filter((np) => np.id_personaje === p.id);
                            return (
                                <div key={p.id} style={cardStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: asignaciones.length > 0 ? 10 : 0 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--border)', flexShrink: 0 }}>
                                            {src
                                                ? <img src={src} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '0.65rem' }}>SIN</div>
                                            }
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{p.nombre}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{asignaciones.length} nodo{asignaciones.length !== 1 ? 's' : ''}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => editar(p)} style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                                            <button onClick={() => eliminarPersonaje(p.id)} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
                                        </div>
                                    </div>
                                    {asignaciones.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                                            {asignaciones.map((np) => (
                                                <span key={np.id} style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', color: '#6d28d9', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    {getNombreNodo(np.id_nodo)} · {np.posicion}
                                                    <button onClick={() => eliminarAsignacion(np.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0, fontSize: '0.75rem', lineHeight: 1 }}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
