import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    readNodos, createNodo, updateNodo, deleteNodo,
    readMisImagenes, readMisAudios,
} from '../../../../services/api';
import { inputStyle, labelStyle, selectStyle, btnPrimary, btnGhost, cardStyle } from '../styles/editorStyles';
import Modal from './Modal';

export default function TabNodos({ historiaId }) {
    const [confirmDelete, setConfirmDelete] = useState(null);
    const FORM = { titulo_nodo: '', texto: '', es_final: false, id_imagen_escenario: '', id_audio_fondo: '' };
    const [nodos, setNodos] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [audios, setAudios] = useState([]);
    const [form, setForm] = useState(FORM);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        cargar();
        Promise.all([readMisImagenes(), readMisAudios()]).then(([i, a]) => {
            setImagenes(i.data); setAudios(a.data);
        }).catch(() => {});
    }, [historiaId]);

    const cargar = async () => {
        const res = await readNodos();
        setNodos(res.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleGuardar = async (e) => {
        e.preventDefault(); setGuardando(true); setErrores({});
        const payload = {
            titulo_nodo: form.titulo_nodo,
            texto: form.texto,
            es_final: form.es_final,
            id_historia: Number(historiaId),
            id_imagen_escenario: form.id_imagen_escenario || null,
            id_audio_fondo: form.id_audio_fondo || null,
        };
        try {
            if (editandoId) { await updateNodo(editandoId, payload); toast.success('Nodo actualizado'); }
            else { await createNodo(payload); toast.success('Nodo creado'); }
            setForm(FORM); setEditandoId(null); cargar();
        } catch (err) {
            if (err.response?.data) setErrores(err.response.data);
            else toast.error('Error al guardar');
        } finally { setGuardando(false); }
    };

    const editar = (n) => {
        setForm({ titulo_nodo: n.titulo_nodo, texto: n.texto, es_final: n.es_final, id_imagen_escenario: n.id_imagen_escenario || '', id_audio_fondo: n.id_audio_fondo || '' });
        setEditandoId(n.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const eliminar = async () => {
        try {
            await deleteNodo(confirmDelete);
            toast.success('Nodo eliminado');
            cargar();
        } catch { toast.error('Error al eliminar'); }
        finally { setConfirmDelete(null); }
    };

    return (
        <>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontSize: '0.95rem' }}>{editandoId ? 'Editar nodo' : 'Nuevo nodo'}</h6>
                <form onSubmit={handleGuardar}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Título interno</label>
                        <input type="text" name="titulo_nodo" value={form.titulo_nodo} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Ej: Escena 1" />
                        {errores.titulo_nodo && <p style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{errores.titulo_nodo.join(', ')}</p>}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Texto narrativo / Diálogo</label>
                        <textarea name="texto" rows={5} value={form.texto} onChange={handleChange} required disabled={guardando} style={{ ...inputStyle, height: 'auto', resize: 'vertical' }} placeholder="Lo que verá el lector..." />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>Imagen de escenario (fondo)</label>
                        <select name="id_imagen_escenario" value={form.id_imagen_escenario} onChange={handleChange} disabled={guardando} style={selectStyle}>
                            <option value="">-- Sin imagen --</option>
                            {imagenes.filter(i => i.tipo === 'escenario').map(i => <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Audio de fondo</label>
                        <select name="id_audio_fondo" value={form.id_audio_fondo} onChange={handleChange} disabled={guardando} style={selectStyle}>
                            <option value="">-- Sin audio --</option>
                            {audios.map(a => <option key={a.id} value={a.id}>{a.descripcion || `Audio ${a.id}`}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <input type="checkbox" id="es_final" name="es_final" checked={form.es_final} onChange={handleChange} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                        <label htmlFor="es_final" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>Es nodo final</label>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={guardando} style={{ ...btnPrimary, flex: 1 }}>{guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}</button>
                        {editandoId && <button type="button" onClick={() => { setForm(FORM); setEditandoId(null); }} style={btnGhost}>Cancelar</button>}
                    </div>
                </form>
            </div>

            <div>
                {nodos.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>Sin nodos. Crea el primero.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {nodos.map((n) => (
                            <div key={n.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{n.titulo_nodo}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                                        ID {n.id}
                                        {n.es_final && ' · Final'}
                                        {n.id_imagen_escenario && ' · Con fondo'}
                                        {n.id_audio_fondo && ' · Con audio'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => editar(n)} style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                                    <button onClick={() => setConfirmDelete(n.id)} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar nodo">
            <p style={{ color: 'var(--text)', marginBottom: 20 }}>
                ¿Eliminar este nodo? Las opciones que lo referencien también se verán afectadas.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setConfirmDelete(null)} style={btnGhost}>Cancelar</button>
                <button onClick={eliminar} style={{ ...btnPrimary, background: 'var(--red)' }}>Eliminar</button>
            </div>
        </Modal>
        </>
    );
}
