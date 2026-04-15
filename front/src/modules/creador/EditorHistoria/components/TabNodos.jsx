import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    readNodos, createNodo, updateNodo, deleteNodo,
    readMisImagenes, readMisAudios, createMiImagen, createMiAudio, readOpciones,
} from '../../../../services/api';
import { inputStyle, labelStyle, selectStyle, btnPrimary, btnGhost, cardStyle } from '../styles/editorStyles';
import Modal from './Modal';
import ModalAlert from '../../../../components/ModalAlert';
import PropTypes from 'prop-types';

function extraerMensajeError(err, fallback) {
    const data = err.response?.data;
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    const mensajes = Object.values(data).flat();
    return mensajes.length > 0 ? mensajes[0] : fallback;
}

function ToggleModo({ modo, onChange }) {
    return (
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            {['seleccionar', 'subir'].map((m) => (
                <button
                    key={m}
                    type="button"
                    onClick={() => onChange(m)}
                    style={{
                        background: modo === m ? 'var(--accent)' : 'var(--surface)',
                        color: modo === m ? '#fff' : 'var(--text-muted)',
                        border: 'none',
                        padding: '3px 10px',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                    }}
                >
                    {m === 'seleccionar' ? 'Biblioteca' : 'Subir nueva'}
                </button>
            ))}
        </div>
    );
}

ToggleModo.propTypes = {
    modo: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default function TabNodos({ historiaId }) {
    const [confirmDelete, setConfirmDelete] = useState(null);
    const FORM = { titulo_nodo: '', texto: '', es_final: false, id_imagen_escenario: '', id_audio_fondo: '' };
    const [nodos, setNodos] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [audios, setAudios] = useState([]);
    const [form, setForm] = useState(FORM);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    // modal de edición
    const [modalEditar, setModalEditar] = useState(null); // nodo completo
    const [formEditar, setFormEditar] = useState({});
    const [guardandoEdit, setGuardandoEdit] = useState(false);
    const [erroresEdit, setErroresEdit] = useState({});

    // modos imagen
    const [modoImagen, setModoImagen] = useState('seleccionar');
    const [imgFile, setImgFile] = useState(null);
    const [imgDesc, setImgDesc] = useState('');
    const [subiendoImg, setSubiendoImg] = useState(false);
    const imgInputRef = useRef(null);

    // modos audio
    const [modoAudio, setModoAudio] = useState('seleccionar');
    const [audFile, setAudFile] = useState(null);
    const [audDesc, setAudDesc] = useState('');
    const [subiendoAud, setSubiendoAud] = useState(false);
    const audInputRef = useRef(null);

    const [alerta, setAlerta] = useState(null);
    const [opciones, setOpciones] = useState([]);

    const cargarRecursos = async () => {
        const [i, a] = await Promise.all([readMisImagenes(), readMisAudios()]);
        setImagenes(i.data);
        setAudios(a.data);
    };

    useEffect(() => {
        cargar();
        cargarRecursos();
    }, [historiaId]);

    const cargar = async () => {
        const [resN, resO] = await Promise.all([readNodos(), readOpciones()]);
        const nodosHistoria = resN.data.filter((n) => Number(n.id_historia) === Number(historiaId));
        setNodos(nodosHistoria);
        const nodosSet = new Set(nodosHistoria.map(n => n.id));
        setOpciones(resO.data.filter(o => nodosSet.has(o.id_nodo_origen)));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubirImagen = async () => {
        if (!imgFile) { toast.error('Selecciona un archivo'); return; }
        setSubiendoImg(true);
        const fd = new FormData();
        fd.append('imagen_para_binario', imgFile);
        fd.append('tipo', 'escenario');
        fd.append('descripcion', imgDesc || imgFile.name);
        try {
            const res = await createMiImagen(fd);
            const nueva = res.data;
            await cargarRecursos();
            setForm((prev) => ({ ...prev, id_imagen_escenario: nueva.id }));
            setModoImagen('seleccionar');
            setImgFile(null); setImgDesc('');
            if (imgInputRef.current) imgInputRef.current.value = '';
            toast.success('Imagen subida y seleccionada');
        } catch (err) {
            setAlerta({ title: 'No se pudo subir la imagen', message: extraerMensajeError(err, 'Error al subir imagen') });
        } finally { setSubiendoImg(false); }
    };

    const handleSubirAudio = async () => {
        if (!audFile) { toast.error('Selecciona un archivo'); return; }
        setSubiendoAud(true);
        const fd = new FormData();
        fd.append('archivo', audFile);
        fd.append('descripcion', audDesc || audFile.name);
        try {
            const res = await createMiAudio(fd);
            const nuevo = res.data;
            await cargarRecursos();
            setForm((prev) => ({ ...prev, id_audio_fondo: nuevo.id }));
            setModoAudio('seleccionar');
            setAudFile(null); setAudDesc('');
            if (audInputRef.current) audInputRef.current.value = '';
            toast.success('Audio subido y seleccionado');
        } catch (err) {
            setAlerta({ title: 'No se pudo subir el audio', message: extraerMensajeError(err, 'Error al subir audio') });
        } finally { setSubiendoAud(false); }
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
            await createNodo(payload);
            toast.success('Escena creada');
            setForm(FORM);
            setModoImagen('seleccionar'); setModoAudio('seleccionar');
            cargar();
        } catch (err) {
            if (err.response?.data) setErrores(err.response.data);
            else toast.error('Error al guardar');
        } finally { setGuardando(false); }
    };

    const abrirEditar = (n) => {
        setFormEditar({
            titulo_nodo: n.titulo_nodo,
            texto: n.texto,
            es_final: n.es_final,
            id_imagen_escenario: n.id_imagen_escenario || '',
            id_audio_fondo: n.id_audio_fondo || '',
        });
        setErroresEdit({});
        setModalEditar(n);
    };

    const handleChangeEdit = (e) => {
        const { name, value, type, checked } = e.target;
        setFormEditar(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleGuardarEdit = async (e) => {
        e.preventDefault();
        setGuardandoEdit(true); setErroresEdit({});
        const payload = {
            titulo_nodo: formEditar.titulo_nodo,
            texto: formEditar.texto,
            es_final: formEditar.es_final,
            id_historia: Number(historiaId),
            id_imagen_escenario: formEditar.id_imagen_escenario || null,
            id_audio_fondo: formEditar.id_audio_fondo || null,
        };
        try {
            await updateNodo(modalEditar.id, payload);
            toast.success('Escena actualizada');
            setModalEditar(null);
            cargar();
        } catch (err) {
            if (err.response?.data) setErroresEdit(err.response.data);
            else toast.error('Error al actualizar');
        } finally { setGuardandoEdit(false); }
    };

    const eliminar = async () => {
        try {
            await deleteNodo(confirmDelete.id);
            toast.success('Escena eliminada');
            cargar();
        } catch { toast.error('Error al eliminar'); }
        finally { setConfirmDelete(null); }
    };

    const imagenesFondo = imagenes.filter((i) => i.tipo === 'escenario');

    return (
        <>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
            <div style={cardStyle}>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontSize: '0.95rem' }}>
                    Nueva escena
                </h6>
                <form onSubmit={handleGuardar}>
                    {/* Título */}
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle} htmlFor="nodo-titulo">Título interno</label>
                        <input id="nodo-titulo" type="text" name="titulo_nodo" value={form.titulo_nodo} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Ej: Escena 1" />
                        {errores.titulo_nodo && <p style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{errores.titulo_nodo.join(', ')}</p>}
                    </div>

                    {/* Texto */}
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle} htmlFor="nodo-texto">Texto narrativo / Diálogo</label>
                        <textarea id="nodo-texto" name="texto" rows={4} value={form.texto} onChange={handleChange} required disabled={guardando} style={{ ...inputStyle, height: 'auto', resize: 'vertical' }} placeholder="Lo que verá el lector..." />
                    </div>

                    {/* Imagen de fondo */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }} htmlFor="nodo-img">Imagen de fondo</label>
                            <ToggleModo modo={modoImagen} onChange={setModoImagen} />
                        </div>

                        {modoImagen === 'seleccionar' ? (
                            <select id="nodo-img" name="id_imagen_escenario" value={form.id_imagen_escenario} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin imagen --</option>
                                {imagenesFondo.map((i) => (
                                    <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>
                                ))}
                            </select>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                <input
                                    type="text"
                                    value={imgDesc}
                                    onChange={(e) => setImgDesc(e.target.value)}
                                    placeholder="Nombre del fondo (opcional)"
                                    style={{ ...inputStyle, fontSize: '0.84rem' }}
                                />
                                <input
                                    ref={imgInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImgFile(e.target.files[0])}
                                    style={{ ...inputStyle, padding: '5px 8px', fontSize: '0.82rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleSubirImagen}
                                    disabled={subiendoImg || !imgFile}
                                    style={{ ...btnPrimary, fontSize: '0.84rem', padding: '7px 14px', opacity: !imgFile ? 0.5 : 1 }}
                                >
                                    {subiendoImg ? 'Subiendo...' : 'Subir y seleccionar'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Audio de fondo */}
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }} htmlFor="nodo-audio">Audio de fondo</label>
                            <ToggleModo modo={modoAudio} onChange={setModoAudio} />
                        </div>

                        {modoAudio === 'seleccionar' ? (
                            <select id="nodo-audio" name="id_audio_fondo" value={form.id_audio_fondo} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin audio --</option>
                                {audios.map((a) => (
                                    <option key={a.id} value={a.id}>{a.descripcion || `Audio ${a.id}`}</option>
                                ))}
                            </select>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                <input
                                    type="text"
                                    value={audDesc}
                                    onChange={(e) => setAudDesc(e.target.value)}
                                    placeholder="Nombre del audio (opcional)"
                                    style={{ ...inputStyle, fontSize: '0.84rem' }}
                                />
                                <input
                                    ref={audInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setAudFile(e.target.files[0])}
                                    style={{ ...inputStyle, padding: '5px 8px', fontSize: '0.82rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleSubirAudio}
                                    disabled={subiendoAud || !audFile}
                                    style={{ ...btnPrimary, fontSize: '0.84rem', padding: '7px 14px', opacity: !audFile ? 0.5 : 1 }}
                                >
                                    {subiendoAud ? 'Subiendo...' : 'Subir y seleccionar'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Nodo final */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <input type="checkbox" id="es_final" name="es_final" checked={form.es_final} onChange={handleChange} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                        <label htmlFor="es_final" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>Es nodo final</label>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={guardando} style={{ ...btnPrimary, flex: 1 }}>
                            {guardando ? 'Guardando...' : 'Agregar escena'}
                        </button>
                    </div>
                </form>
            </div>

            <div>
                {nodos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                        </svg>
                        <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Sin escenas todavía</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 320, margin: '0 auto' }}>
                            Cada escena tiene un texto narrativo que el lector verá, y puede tener un fondo y audio. Crea la primera usando el formulario.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(() => {
                            const conteoOpciones = {};
                            opciones.forEach(o => { conteoOpciones[o.id_nodo_origen] = (conteoOpciones[o.id_nodo_origen] || 0) + 1; });
                            return nodos.map((n) => {
                                const salidas = conteoOpciones[n.id] || 0;
                                const sinSalida = !n.es_final && salidas === 0;
                                return (
                                    <div key={n.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{n.titulo_nodo}</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {n.es_final && (
                                                    <span style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', color: 'var(--green)', borderRadius: 20, padding: '2px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                        Final
                                                    </span>
                                                )}
                                                {!n.es_final && salidas > 0 && (
                                                    <span style={{ background: 'var(--accent-light)', border: '1px solid var(--border-focus)', color: 'var(--accent)', borderRadius: 20, padding: '2px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                        {salidas} salida{salidas > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                {sinSalida && (
                                                    <span style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 20, padding: '2px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                        ⚠ Sin salida
                                                    </span>
                                                )}
                                                {n.id_imagen_escenario && (
                                                    <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 20, padding: '2px 9px', fontSize: '0.72rem', fontWeight: 600 }}>
                                                        Con fondo
                                                    </span>
                                                )}
                                                {n.id_audio_fondo && (
                                                    <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 20, padding: '2px 9px', fontSize: '0.72rem', fontWeight: 600 }}>
                                                        Con audio
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                            <button onClick={() => abrirEditar(n)} style={{ background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                                            <button onClick={() => setConfirmDelete({ id: n.id, nombre: n.titulo_nodo })} style={{ background: 'var(--red-bg)', border: 'none', color: 'var(--red)', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                )}
            </div>
        </div>

        <ModalAlert
            open={!!confirmDelete}
            type="warning"
            title="¿Eliminar escena?"
            message={`¿Seguro que quieres eliminar "${confirmDelete?.nombre}"? Las decisiones que la referencien también se verán afectadas.`}
            confirmText="Sí, eliminar"
            cancelText="Cancelar"
            onClose={(ok) => { if (ok) eliminar(); else setConfirmDelete(null); }}
        />

        <Modal isOpen={!!modalEditar} onClose={() => setModalEditar(null)} titulo="Editar escena" ancho={520}>
            {modalEditar && (
                <form onSubmit={handleGuardarEdit}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle} htmlFor="edit-nodo-titulo">Título interno</label>
                        <input id="edit-nodo-titulo" type="text" name="titulo_nodo" value={formEditar.titulo_nodo} onChange={handleChangeEdit} required disabled={guardandoEdit} style={inputStyle} />
                        {erroresEdit.titulo_nodo && <p style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{erroresEdit.titulo_nodo.join(', ')}</p>}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle} htmlFor="edit-nodo-texto">Texto narrativo / Diálogo</label>
                        <textarea id="edit-nodo-texto" name="texto" rows={4} value={formEditar.texto} onChange={handleChangeEdit} required disabled={guardandoEdit} style={{ ...inputStyle, height: 'auto', resize: 'vertical' }} />
                        {erroresEdit.texto && <p style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{erroresEdit.texto.join(', ')}</p>}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle} htmlFor="edit-nodo-img">Imagen de fondo</label>
                        <select id="edit-nodo-img" name="id_imagen_escenario" value={formEditar.id_imagen_escenario} onChange={handleChangeEdit} disabled={guardandoEdit} style={selectStyle}>
                            <option value="">-- Sin imagen --</option>
                            {imagenesFondo.map((i) => (
                                <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle} htmlFor="edit-nodo-audio">Audio de fondo</label>
                        <select id="edit-nodo-audio" name="id_audio_fondo" value={formEditar.id_audio_fondo} onChange={handleChangeEdit} disabled={guardandoEdit} style={selectStyle}>
                            <option value="">-- Sin audio --</option>
                            {audios.map((a) => (
                                <option key={a.id} value={a.id}>{a.descripcion || `Audio ${a.id}`}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <input type="checkbox" id="es_final_edit" name="es_final" checked={formEditar.es_final} onChange={handleChangeEdit} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                        <label htmlFor="es_final_edit" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>Es nodo final</label>
                    </div>

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setModalEditar(null)} style={btnGhost} disabled={guardandoEdit}>Cancelar</button>
                        <button type="submit" style={btnPrimary} disabled={guardandoEdit}>
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
        </>
    );
}

TabNodos.propTypes = {
    historiaId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
