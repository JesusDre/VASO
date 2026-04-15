import { useState, useEffect } from 'react';
import {
    readNodos, readOpciones, createOpcion, updateOpcion, deleteOpcion,
} from '../../../../services/api';
import { inputStyle, labelStyle, selectStyle, btnPrimary, btnGhost, cardStyle } from '../styles/editorStyles';
import Modal from './Modal';
import ModalAlert from '../../../../components/ModalAlert';
import toast from 'react-hot-toast';

export default function TabOpciones({ historiaId }) {
    const FORM = { texto_opcion: '', id_nodo_origen: '', id_nodo_destino: '' };
    const [opciones, setOpciones] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [form, setForm] = useState(FORM);
    const [guardando, setGuardando] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null); // { id, texto_opcion }
    const [alerta, setAlerta] = useState(null);

    // modal de edición
    const [modalEditar, setModalEditar] = useState(null); // opción completa
    const [formEditar, setFormEditar] = useState({});
    const [guardandoEdit, setGuardandoEdit] = useState(false);

    useEffect(() => { cargar(); }, [historiaId]);

    const cargar = async () => {
        try {
            const [resOp, resNod] = await Promise.all([readOpciones(), readNodos()]);
            const nodosHistoria = resNod.data.filter(n => Number(n.id_historia) === Number(historiaId));
            setNodos(nodosHistoria);
            const nodosSet = new Set(nodosHistoria.map(n => n.id));
            setOpciones(resOp.data.filter(o => nodosSet.has(o.id_nodo_origen)));
        } catch {
            setAlerta({ type: 'error', title: 'Error al cargar', message: 'No se pudieron cargar las decisiones. Intenta recargar la página.' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
            // Si cambia el origen y el destino es igual, limpiar destino
            ...(name === 'id_nodo_origen' && value === prev.id_nodo_destino ? { id_nodo_destino: '' } : {}),
        }));
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (form.id_nodo_origen === form.id_nodo_destino) {
            setAlerta({ type: 'warning', title: 'Configuración inválida', message: 'La escena de origen y la de destino no pueden ser la misma.' });
            return;
        }
        setGuardando(true);
        const payload = {
            texto_opcion: form.texto_opcion,
            id_nodo_origen: Number(form.id_nodo_origen),
            id_nodo_destino: Number(form.id_nodo_destino),
        };
        try {
            await createOpcion(payload);
            toast.success('Decisión creada');
            setForm(FORM);
            cargar();
        } catch {
            setAlerta({ type: 'error', title: 'No se pudo guardar', message: 'Ocurrió un error al guardar la decisión. Verifica los datos e intenta de nuevo.' });
        } finally { setGuardando(false); }
    };

    const abrirEditar = (o) => {
        setFormEditar({ texto_opcion: o.texto_opcion, id_nodo_origen: String(o.id_nodo_origen), id_nodo_destino: String(o.id_nodo_destino) });
        setModalEditar(o);
    };

    const handleChangeEdit = (e) => {
        const { name, value } = e.target;
        setFormEditar(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'id_nodo_origen' && value === prev.id_nodo_destino ? { id_nodo_destino: '' } : {}),
        }));
    };

    const handleGuardarEdit = async (e) => {
        e.preventDefault();
        if (formEditar.id_nodo_origen === formEditar.id_nodo_destino) {
            setAlerta({ type: 'warning', title: 'Configuración inválida', message: 'La escena de origen y la de destino no pueden ser la misma.' });
            return;
        }
        setGuardandoEdit(true);
        const payload = {
            texto_opcion: formEditar.texto_opcion,
            id_nodo_origen: Number(formEditar.id_nodo_origen),
            id_nodo_destino: Number(formEditar.id_nodo_destino),
        };
        try {
            await updateOpcion(modalEditar.id, payload);
            toast.success('Decisión actualizada');
            setModalEditar(null);
            cargar();
        } catch {
            setAlerta({ type: 'error', title: 'No se pudo guardar', message: 'Ocurrió un error al actualizar la decisión.' });
        } finally { setGuardandoEdit(false); }
    };

    const confirmarEliminar = async () => {
        try {
            await deleteOpcion(confirmDelete.id);
            toast.success('Decisión eliminada');
            cargar();
        } catch {
            setAlerta({ type: 'error', title: 'Error al eliminar', message: 'No se pudo eliminar la decisión.' });
        } finally { setConfirmDelete(null); }
    };

    const nombreNodo = (id) => nodos.find(n => n.id === Number(id))?.titulo_nodo || `Escena ${id}`;

    // Nodos que no son finales y no tienen opciones salientes → "sin salida"
    const nodoIdsConOpciones = new Set(opciones.map(o => o.id_nodo_origen));
    const nodosHuerfanos = nodos.filter(n => !n.es_final && !nodoIdsConOpciones.has(n.id));

    // Para el select de destino: excluir la escena de origen seleccionada
    const nodosDestino = nodos.filter(n => String(n.id) !== String(form.id_nodo_origen));

    // Preview en vivo del formulario
    const mostrarPreview = form.texto_opcion.trim() && form.id_nodo_origen && form.id_nodo_destino;

    return (
        <>
        {/* Banner de advertencia: escenas sin salida */}
        {nodosHuerfanos.length > 0 && (
            <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <div>
                        <p style={{ fontWeight: 700, color: '#92400e', margin: '0 0 4px', fontSize: '0.9rem' }}>
                            {nodosHuerfanos.length} escena{nodosHuerfanos.length > 1 ? 's' : ''} sin salida
                        </p>
                        <p style={{ color: '#92400e', fontSize: '0.82rem', margin: '0 0 6px' }}>
                            El lector quedaría bloqueado al llegar a estas escenas. Crea una decisión para ellas o márcalas como finales:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {nodosHuerfanos.map(n => (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, id_nodo_origen: String(n.id) }))}
                                    style={{ background: '#fde68a', border: '1px solid #fbbf24', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}
                                >
                                    {n.titulo_nodo}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr', gap: 20 }}>

            {/* Formulario */}
            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontSize: '0.95rem' }}>
                    Nueva decisión
                </h6>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                    Una decisión conecta dos escenas y le da al lector una opción a elegir.
                </p>

                <form onSubmit={handleGuardar}>
                    {/* Texto de la opción */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>¿Qué ve el lector?</label>
                        <input
                            type="text" name="texto_opcion" value={form.texto_opcion}
                            onChange={handleChange} required disabled={guardando}
                            style={inputStyle} placeholder='Ej: "Entrar al bosque oscuro"'
                            maxLength={120}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            El texto del botón que aparece al final de la escena.
                        </p>
                    </div>

                    {/* Nodo origen */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>¿En qué escena aparece?</label>
                        <select name="id_nodo_origen" value={form.id_nodo_origen} onChange={handleChange} required disabled={guardando} style={selectStyle}>
                            <option value="">-- Selecciona la escena --</option>
                            {nodos.map(n => (
                                <option key={n.id} value={n.id}>
                                    {n.titulo_nodo}{n.es_final ? ' (final)' : ''}
                                </option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            La escena donde el lector tomará esta decisión.
                        </p>
                    </div>

                    {/* Nodo destino */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>¿A qué escena lleva?</label>
                        <select name="id_nodo_destino" value={form.id_nodo_destino} onChange={handleChange} required disabled={guardando || !form.id_nodo_origen} style={selectStyle}>
                            <option value="">-- Selecciona la escena --</option>
                            {nodosDestino.map(n => (
                                <option key={n.id} value={n.id}>{n.titulo_nodo}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            La escena que se abrirá al elegir esta opción.
                        </p>
                    </div>

                    {/* Preview en vivo */}
                    {mostrarPreview && (
                        <div style={{ background: 'var(--accent-light)', border: '1px solid var(--border-focus)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', margin: '0 0 8px' }}>Vista previa</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {nombreNodo(form.id_nodo_origen)}
                                </span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 5, padding: '3px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {form.texto_opcion}
                                </span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {nombreNodo(form.id_nodo_destino)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={guardando} style={{ ...btnPrimary, flex: 1 }}>
                            {guardando ? '...' : 'Agregar decisión'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de decisiones */}
            <div>
                {opciones.length === 0 ? (
                    <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ marginBottom: 14, color: 'var(--text-muted)' }}>
                            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="2" x2="12" y2="6"/>
                                <path d="M12 6 L6 12 M12 6 L18 12"/>
                                <rect x="2" y="12" width="8" height="5" rx="2"/>
                                <rect x="14" y="12" width="8" height="5" rx="2"/>
                            </svg>
                        </div>
                        <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontSize: '1rem' }}>Sin decisiones todavía</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.5 }}>
                            Las decisiones conectan escenas y crean la narrativa ramificada. El lector elige un camino y la historia lo lleva a una escena diferente.
                        </p>
                        {/* Mini diagrama explicativo */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--surface-2)', borderRadius: 8, fontSize: '0.82rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 10px', fontWeight: 600, color: 'var(--text-muted)' }}>Escena A</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                            <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 5, padding: '4px 10px', fontWeight: 700 }}>¿Ir al bosque?</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                            <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 10px', fontWeight: 600, color: 'var(--text-muted)' }}>Escena B</span>
                        </div>
                        {nodos.length < 2 && (
                            <p style={{ color: 'var(--yellow)', fontSize: '0.82rem', marginTop: 16, fontWeight: 600 }}>
                                Necesitas al menos 2 escenas para crear decisiones.
                            </p>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>
                            {opciones.length} decisión{opciones.length !== 1 ? 'es' : ''} configurada{opciones.length !== 1 ? 's' : ''}
                        </p>
                        {opciones.map(o => (
                            <div key={o.id} style={cardStyle}>
                                {/* Flujo visual */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                                    <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                        {nombreNodo(o.id_nodo_origen)}
                                    </span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                    <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: '0.84rem', fontWeight: 700, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {o.texto_opcion}
                                    </span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                    <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                        {nombreNodo(o.id_nodo_destino)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                    <button onClick={() => abrirEditar(o)} style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                                        Editar
                                    </button>
                                    <button onClick={() => setConfirmDelete({ id: o.id, texto_opcion: o.texto_opcion })} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <ModalAlert
            open={!!confirmDelete}
            type="warning"
            title="¿Eliminar decisión?"
            message={`¿Seguro que quieres eliminar "${confirmDelete?.texto_opcion}"? El lector ya no podrá navegar por esta ruta.`}
            confirmText="Sí, eliminar"
            cancelText="Cancelar"
            onClose={(ok) => { if (ok) confirmarEliminar(); else setConfirmDelete(null); }}
        />

        <Modal isOpen={!!modalEditar} onClose={() => !guardandoEdit && setModalEditar(null)} titulo="Editar decisión" ancho={500}>
            {modalEditar && (
                <form onSubmit={handleGuardarEdit}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>¿Qué ve el lector?</label>
                        <input
                            type="text" name="texto_opcion" value={formEditar.texto_opcion}
                            onChange={handleChangeEdit} required disabled={guardandoEdit}
                            style={inputStyle} placeholder='Ej: "Entrar al bosque oscuro"'
                            maxLength={120} autoFocus
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            El texto del botón que aparece al final de la escena.
                        </p>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>¿En qué escena aparece?</label>
                        <select name="id_nodo_origen" value={formEditar.id_nodo_origen} onChange={handleChangeEdit} required disabled={guardandoEdit} style={selectStyle}>
                            <option value="">-- Selecciona la escena --</option>
                            {nodos.map(n => (
                                <option key={n.id} value={n.id}>{n.titulo_nodo}{n.es_final ? ' (final)' : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>¿A qué escena lleva?</label>
                        <select name="id_nodo_destino" value={formEditar.id_nodo_destino} onChange={handleChangeEdit} required disabled={guardandoEdit || !formEditar.id_nodo_origen} style={selectStyle}>
                            <option value="">-- Selecciona la escena --</option>
                            {nodos.filter(n => String(n.id) !== String(formEditar.id_nodo_origen)).map(n => (
                                <option key={n.id} value={n.id}>{n.titulo_nodo}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preview en vivo */}
                    {formEditar.texto_opcion?.trim() && formEditar.id_nodo_origen && formEditar.id_nodo_destino && (
                        <div style={{ background: 'var(--accent-light)', border: '1px solid var(--border-focus)', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', margin: '0 0 8px' }}>Vista previa</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {nombreNodo(formEditar.id_nodo_origen)}
                                </span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 5, padding: '3px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {formEditar.texto_opcion}
                                </span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {nombreNodo(formEditar.id_nodo_destino)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setModalEditar(null)} disabled={guardandoEdit} style={btnGhost}>Cancelar</button>
                        <button type="submit" disabled={guardandoEdit} style={btnPrimary}>
                            {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>

        <ModalAlert
            open={!!alerta}
            onClose={() => setAlerta(null)}
            type={alerta?.type || 'error'}
            title={alerta?.title || 'Error'}
            message={alerta?.message || ''}
            hideCancel
            confirmText="Entendido"
        />
        </>
    );
}
