import { useState, useEffect } from 'react';
import {
    readNodos, readOpciones, createOpcion, updateOpcion, deleteOpcion,
} from '../../../../services/api';
import { inputStyle, labelStyle, selectStyle, btnPrimary, btnGhost, cardStyle } from '../styles/editorStyles';
import Modal from './Modal';
import toast from 'react-hot-toast';

export default function TabOpciones({ historiaId }) {
    const FORM = { texto_opcion: '', id_nodo_origen: '', id_nodo_destino: '' };
    const [opciones, setOpciones] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [form, setForm] = useState(FORM);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        cargar();
        readNodos()
            .then(r => setNodos(r.data.filter(n => Number(n.id_historia) === Number(historiaId))))
            .catch(() => {});
    }, [historiaId]);

    const cargar = async () => {
        try {
            const [resOp, resNod] = await Promise.all([readOpciones(), readNodos()]);
            const nodosHistoria = new Set(
                resNod.data.filter(n => Number(n.id_historia) === Number(historiaId)).map(n => n.id)
            );
            setOpciones(resOp.data.filter(o => nodosHistoria.has(o.id_nodo_origen)));
        } catch { toast.error('Error al cargar opciones'); }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        const payload = {
            texto_opcion: form.texto_opcion,
            id_nodo_origen: Number(form.id_nodo_origen),
            id_nodo_destino: Number(form.id_nodo_destino),
        };
        try {
            if (editandoId) {
                await updateOpcion(editandoId, payload);
                toast.success('Opción actualizada');
            } else {
                await createOpcion(payload);
                toast.success('Opción creada');
            }
            setForm(FORM);
            setEditandoId(null);
            cargar();
        } catch { toast.error('Error al guardar'); }
        finally { setGuardando(false); }
    };

    const editar = (o) => {
        setForm({ texto_opcion: o.texto_opcion, id_nodo_origen: o.id_nodo_origen, id_nodo_destino: o.id_nodo_destino });
        setEditandoId(o.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const confirmarEliminar = async () => {
        try {
            await deleteOpcion(confirmDelete);
            toast.success('Opción eliminada');
            cargar();
        } catch { toast.error('Error al eliminar'); }
        finally { setConfirmDelete(null); }
    };

    const nombreNodo = (id) => nodos.find(n => n.id === id)?.titulo_nodo || `Nodo ${id}`;

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
                <div style={cardStyle}>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontSize: '0.95rem' }}>
                        {editandoId ? 'Editar opción' : 'Nueva opción'}
                    </h6>
                    <form onSubmit={handleGuardar}>
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>Texto de la opción</label>
                            <input
                                type="text" name="texto_opcion" value={form.texto_opcion}
                                onChange={handleChange} required disabled={guardando}
                                style={inputStyle} placeholder="Lo que elige el lector"
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>Nodo origen</label>
                            <select name="id_nodo_origen" value={form.id_nodo_origen} onChange={handleChange} required disabled={guardando} style={selectStyle}>
                                <option value="">-- Desde qué nodo --</option>
                                {nodos.map(n => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Nodo destino</label>
                            <select name="id_nodo_destino" value={form.id_nodo_destino} onChange={handleChange} required disabled={guardando} style={selectStyle}>
                                <option value="">-- A qué nodo lleva --</option>
                                {nodos.map(n => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" disabled={guardando} style={{ ...btnPrimary, flex: 1 }}>
                                {guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}
                            </button>
                            {editandoId && (
                                <button type="button" onClick={() => { setForm(FORM); setEditandoId(null); }} style={btnGhost}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div>
                    {opciones.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>
                            Sin opciones. Crea la primera.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {opciones.map((o) => (
                                <div key={o.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{o.texto_opcion}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                                            {nombreNodo(o.id_nodo_origen)} → {nombreNodo(o.id_nodo_destino)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            onClick={() => editar(o)}
                                            style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(o.id)}
                                            style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar opción">
                <p style={{ color: 'var(--text)', marginBottom: 20 }}>
                    ¿Eliminar esta opción de decisión?
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={() => setConfirmDelete(null)} style={btnGhost}>Cancelar</button>
                    <button onClick={confirmarEliminar} style={{ ...btnPrimary, background: 'var(--red)' }}>Eliminar</button>
                </div>
            </Modal>
        </>
    );
}
