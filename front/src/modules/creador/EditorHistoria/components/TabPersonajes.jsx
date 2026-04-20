import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    API_BASE,
    readPersonajes, createPersonaje, updatePersonaje, deletePersonaje,
    readMisImagenes, readNodos, readNodoPersonajes,
    createNodoPersonaje, deleteNodoPersonaje, createMiImagen,
} from '../../../../services/api';
import { inputStyle, labelStyle, selectStyle, btnPrimary, btnGhost, cardStyle } from '../styles/editorStyles';
import Modal from './Modal';
import ModalAlert from '../../../../components/ModalAlert';

function getSpritePreviewSrc(imagenes, id_imagen) {
    const img = imagenes.find((i) => i.id === Number(id_imagen));
    if (!img) return null;
    if (img.imagen_base64_display) return `data:image/png;base64,${img.imagen_base64_display}`;
    if (img.url) return `${API_BASE}${img.url}`;
    return null;
}

function extraerMensajeError(err, fallback) {
    const data = err.response?.data;
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    const mensajes = Object.values(data).flat();
    return mensajes.length > 0 ? mensajes[0] : fallback;
}

export default function TabPersonajes({ historiaId }) {
    const FORM_P = { nombre: '', id_imagen: '' };
    const [personajes, setPersonajes] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [nodoPersonajes, setNodoPersonajes] = useState([]);
    const [form, setForm] = useState(FORM_P);
    const [guardando, setGuardando] = useState(false);

    // modal de edición
    const [modalEditar, setModalEditar] = useState(null); // personaje completo
    const [formEditar, setFormEditar] = useState({});
    const [guardandoEdit, setGuardandoEdit] = useState(false);
    const [asignForm, setAsignForm] = useState({ id_personaje: '', id_nodo: '', posicion: 'centro' });
    const [asignando, setAsignando] = useState(false);

    // subida de sprite inline
    const [modoSprite, setModoSprite] = useState('seleccionar'); // 'seleccionar' | 'subir'
    const [spriteFile, setSpriteFile] = useState(null);
    const [spriteDesc, setSpriteDesc] = useState('');
    const [subiendoSprite, setSubiendoSprite] = useState(false);
    const spriteInputRef = useRef(null);

    const [alerta, setAlerta] = useState(null);
    const [confirmEliminar, setConfirmEliminar] = useState(null);

    const cargar = async () => {
        const [rp, ri, rn, rnp] = await Promise.all([readPersonajes(), readMisImagenes(), readNodos(), readNodoPersonajes()]);
        setPersonajes(rp.data.filter((p) => Number(p.id_historia) === Number(historiaId)));
        setImagenes(ri.data.filter((i) => i.tipo === 'personaje'));
        setNodos(rn.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
        setNodoPersonajes(rnp.data);
    };

    useEffect(() => { cargar(); }, [historiaId]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubirSprite = async () => {
        if (!spriteFile) { toast.error('Selecciona un archivo'); return; }
        setSubiendoSprite(true);
        const fd = new FormData();
        fd.append('imagen_para_binario', spriteFile);
        fd.append('tipo', 'personaje');
        fd.append('descripcion', spriteDesc || spriteFile.name);
        try {
            const res = await createMiImagen(fd);
            const nueva = res.data;
            await cargar();
            setForm((prev) => ({ ...prev, id_imagen: nueva.id }));
            setModoSprite('seleccionar');
            setSpriteFile(null);
            setSpriteDesc('');
            if (spriteInputRef.current) spriteInputRef.current.value = '';
            toast.success('Sprite subido y seleccionado');
        } catch (err) {
            setAlerta({ title: 'No se pudo subir el sprite', message: extraerMensajeError(err, 'Error al subir imagen') });
        } finally {
            setSubiendoSprite(false);
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        const payload = { nombre: form.nombre, id_historia: Number(historiaId), id_imagen: form.id_imagen || null };
        try {
            await createPersonaje(payload);
            toast.success('Personaje creado');
            setForm(FORM_P); setModoSprite('seleccionar'); cargar();
        } catch { toast.error('Error al guardar personaje'); }
        finally { setGuardando(false); }
    };

    const eliminarPersonaje = (id, nombre) => setConfirmEliminar({ id, nombre });

    const confirmarEliminarPersonaje = async () => {
        try {
            await deletePersonaje(confirmEliminar.id);
            toast.success('Personaje eliminado');
            cargar();
        } catch {
            setAlerta({ title: 'Error al eliminar', message: 'No se pudo eliminar el personaje.' });
        } finally {
            setConfirmEliminar(null);
        }
    };

    const abrirEditar = (p) => {
        setFormEditar({ nombre: p.nombre, id_imagen: p.id_imagen || '' });
        setModalEditar(p);
    };

    const handleGuardarEdit = async (e) => {
        e.preventDefault();
        setGuardandoEdit(true);
        const payload = { nombre: formEditar.nombre, id_historia: Number(historiaId), id_imagen: formEditar.id_imagen || null };
        try {
            await updatePersonaje(modalEditar.id, payload);
            toast.success('Personaje actualizado');
            setModalEditar(null); cargar();
        } catch { toast.error('Error al actualizar personaje'); }
        finally { setGuardandoEdit(false); }
    };

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
        if (img.url) return `${API_BASE}${img.url}`;
        return null;
    };

    const spriteSrc = getSpritePreviewSrc(imagenes, form.id_imagen);

    return (
        <>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {nodos.length === 0 && (
                    <div style={{ ...cardStyle, background: '#fef9c3', border: '1px solid #fde68a' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <div>
                                <p style={{ fontWeight: 700, color: '#92400e', margin: '0 0 4px', fontSize: '0.88rem' }}>
                                    Crea una escena primero
                                </p>
                                <p style={{ color: '#92400e', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
                                    Los personajes se asignan a escenas. Ve a la pestaña Escenas y crea al menos una antes de agregar personajes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <div style={{ ...cardStyle, opacity: nodos.length === 0 ? 0.5 : 1, pointerEvents: nodos.length === 0 ? 'none' : 'auto' }}>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontSize: '0.95rem' }}>
                        Nuevo personaje
                    </h6>
                    <form onSubmit={handleGuardar}>
                        {/* Nombre */}
                        <div style={{ marginBottom: 14 }}>
                            <label htmlFor="p-nombre" style={labelStyle}>Nombre</label>
                            <input id="p-nombre" type="text" name="nombre" value={form.nombre} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Ej: Aria" />
                        </div>

                        {/* Sprite */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label htmlFor="p-sprite" style={{ ...labelStyle, marginBottom: 0 }}>Sprite</label>
                                <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                                    {['seleccionar', 'subir'].map((modo) => (
                                        <button
                                            key={modo}
                                            type="button"
                                            onClick={() => setModoSprite(modo)}
                                            style={{
                                                background: modoSprite === modo ? 'var(--accent)' : 'var(--surface)',
                                                color: modoSprite === modo ? '#fff' : 'var(--text-muted)',
                                                border: 'none',
                                                padding: '3px 10px',
                                                cursor: 'pointer',
                                                fontSize: '0.74rem',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {modo === 'seleccionar' ? 'Biblioteca' : 'Subir nueva'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {modoSprite === 'seleccionar' ? (
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    {spriteSrc && (
                                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                                            <img src={spriteSrc} alt="sprite" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <select id="p-sprite" name="id_imagen" value={form.id_imagen} onChange={handleChange} disabled={guardando} style={{ ...selectStyle, flex: 1 }}>
                                        <option value="">-- Sin sprite --</option>
                                        {imagenes.map((i) => (
                                            <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                    <input
                                        type="text"
                                        value={spriteDesc}
                                        onChange={(e) => setSpriteDesc(e.target.value)}
                                        placeholder="Nombre del sprite (opcional)"
                                        style={{ ...inputStyle, fontSize: '0.84rem' }}
                                    />
                                    <input
                                        ref={spriteInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSpriteFile(e.target.files[0])}
                                        style={{ ...inputStyle, padding: '5px 8px', fontSize: '0.82rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSubirSprite}
                                        disabled={subiendoSprite || !spriteFile}
                                        style={{
                                            ...btnPrimary,
                                            fontSize: '0.84rem',
                                            padding: '7px 14px',
                                            opacity: spriteFile ? 1 : 0.5,
                                        }}
                                    >
                                        {subiendoSprite ? 'Subiendo...' : 'Subir y seleccionar'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" disabled={guardando} style={{ ...btnPrimary, flex: 1 }}>
                                {guardando ? '...' : 'Agregar'}
                            </button>
                        </div>
                    </form>
                </div>

                {personajes.length > 0 && nodos.length > 0 && (
                    <div style={cardStyle}>
                        <h6 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 16, fontSize: '0.95rem' }}>Asignar a nodo</h6>
                        <form onSubmit={handleAsign}>
                            <div style={{ marginBottom: 12 }}>
                                <label htmlFor="asign-personaje" style={labelStyle}>Personaje</label>
                                <select id="asign-personaje" value={asignForm.id_personaje} onChange={(e) => setAsignForm({ ...asignForm, id_personaje: e.target.value })} required style={selectStyle}>
                                    <option value="">-- Personaje --</option>
                                    {personajes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <label htmlFor="asign-nodo" style={labelStyle}>Nodo</label>
                                <select id="asign-nodo" value={asignForm.id_nodo} onChange={(e) => setAsignForm({ ...asignForm, id_nodo: e.target.value })} required style={selectStyle}>
                                    <option value="">-- Nodo --</option>
                                    {nodos.map((n) => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label htmlFor="asign-posicion" style={labelStyle}>Posición en pantalla</label>
                                <select id="asign-posicion" value={asignForm.posicion} onChange={(e) => setAsignForm({ ...asignForm, posicion: e.target.value })} style={selectStyle}>
                                    <option value="izquierda">Izquierda</option>
                                    <option value="centro">Centro</option>
                                    <option value="derecha">Derecha</option>
                                </select>
                            </div>
                            <button type="submit" disabled={asignando} style={{ ...btnPrimary, width: '100%' }}>
                                {asignando ? '...' : 'Asignar'}
                            </button>
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
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{asignaciones.length} nodo{asignaciones.length === 1 ? '' : 's'}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => abrirEditar(p)} style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                                            <button onClick={() => eliminarPersonaje(p.id, p.nombre)} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
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

        <Modal isOpen={!!modalEditar} onClose={() => !guardandoEdit && setModalEditar(null)} titulo="Editar personaje" ancho={420}>
            {modalEditar && (
                <form onSubmit={handleGuardarEdit}>
                    <div style={{ marginBottom: 14 }}>
                        <label htmlFor="p-edit-nombre" style={labelStyle}>Nombre</label>
                        <input
                            id="p-edit-nombre"
                            type="text"
                            value={formEditar.nombre}
                            onChange={(e) => setFormEditar(prev => ({ ...prev, nombre: e.target.value }))}
                            required
                            disabled={guardandoEdit}
                            style={inputStyle}
                            autoFocus
                        />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label htmlFor="p-edit-sprite" style={labelStyle}>Sprite</label>
                        <select
                            id="p-edit-sprite"
                            value={formEditar.id_imagen}
                            onChange={(e) => setFormEditar(prev => ({ ...prev, id_imagen: e.target.value }))}
                            disabled={guardandoEdit}
                            style={selectStyle}
                        >
                            <option value="">-- Sin sprite --</option>
                            {imagenes.map((i) => (
                                <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>
                            ))}
                        </select>
                    </div>
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
            type="error"
            title={alerta?.title || 'Error'}
            message={alerta?.message || ''}
            hideCancel
            confirmText="Entendido"
        />

        <ModalAlert
            open={!!confirmEliminar}
            onClose={(confirmado) => {
                if (confirmado) confirmarEliminarPersonaje();
                else setConfirmEliminar(null);
            }}
            type="warning"
            title="¿Eliminar personaje?"
            message={`Se eliminará "${confirmEliminar?.nombre}" y todas sus asignaciones a escenas. Esta acción no se puede deshacer.`}
            confirmText="Sí, eliminar"
            cancelText="Cancelar"
        />
        </>
    );
}

TabPersonajes.propTypes = {
    historiaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
