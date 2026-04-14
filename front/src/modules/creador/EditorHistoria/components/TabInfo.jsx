import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    readHistoria, createHistoria, updateHistoria,
    readNodos, readImagenes, createImagen, readCategorias,
} from '../../../../services/api';
import { inputStyle, labelStyle, selectStyle, btnPrimary } from '../styles/editorStyles';

export default function TabInfo({ historia, historiaId, usuario, onGuardado }) {
    const FORM_INICIAL = { titulo: '', descripcion: '', publicada: false, id_nodo_inicio: '', id_portada: '', categoria: '' };
    const [form, setForm] = useState(historia
        ? {
            titulo: historia.titulo,
            descripcion: historia.descripcion,
            publicada: historia.publicada,
            id_nodo_inicio: historia.id_nodo_inicio || '',
            id_portada: historia.id_portada || '',
            categoria: historia.categoria || '',
        }
        : FORM_INICIAL);
    const [nodos, setNodos] = useState([]);
    const [portadas, setPortadas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});
    const [subiendoPortada, setSubiendoPortada] = useState(false);
    const [imgError, setImgError] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (historiaId) {
            readNodos().then((r) => {
                setNodos(r.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
            }).catch(() => {});
        }
        readImagenes().then((r) => {
            setPortadas(r.data.filter((i) => i.tipo === 'portada'));
        }).catch(() => {});
        readCategorias().then((r) => setCategorias(r.data)).catch(() => {});
    }, [historiaId]);

    useEffect(() => { setImgError(false); }, [form.id_portada]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handlePortadaChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSubiendoPortada(true);
        const fd = new FormData();
        fd.append('imagen_para_binario', file);
        fd.append('tipo', 'portada');
        fd.append('descripcion', file.name);
        try {
            const res = await createImagen(fd);
            const nuevaPortada = res.data;
            setPortadas((prev) => [...prev, nuevaPortada]);
            setForm((prev) => ({ ...prev, id_portada: nuevaPortada.id }));
            toast.success('Portada subida');
        } catch {
            toast.error('Error al subir portada');
        } finally {
            setSubiendoPortada(false);
            e.target.value = '';
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setErrores({});
        const payload = {
            titulo: form.titulo,
            descripcion: form.descripcion,
            publicada: form.publicada,
            id_creador: usuario.id,
            id_nodo_inicio: form.id_nodo_inicio || null,
            id_portada: form.id_portada || null,
            categoria: form.categoria || null,
        };
        try {
            if (historiaId) {
                await updateHistoria(historiaId, payload);
                toast.success('Historia guardada');
            } else {
                const res = await createHistoria({ ...payload, publicada: false });
                toast.success('Historia creada');
                onGuardado(res.data.id);
            }
        } catch (err) {
            if (err.response?.data) setErrores(err.response.data);
            toast.error('Error al guardar');
        } finally {
            setGuardando(false);
        }
    };

    const handlePublicar = async () => {
        setGuardando(true);
        try {
            const payload = {
                titulo: form.titulo,
                descripcion: form.descripcion,
                publicada: true,
                id_creador: usuario.id,
                id_nodo_inicio: form.id_nodo_inicio || null,
                id_portada: form.id_portada || null,
                categoria: form.categoria || null,
            };
            await updateHistoria(historiaId, payload);
            setForm((prev) => ({ ...prev, publicada: true }));
            toast.success('Historia publicada');
        } catch {
            toast.error('Error al publicar');
        } finally {
            setGuardando(false);
        }
    };

    const handleDespublicar = async () => {
        setGuardando(true);
        try {
            const payload = {
                titulo: form.titulo,
                descripcion: form.descripcion,
                publicada: false,
                id_creador: usuario.id,
                id_nodo_inicio: form.id_nodo_inicio || null,
                id_portada: form.id_portada || null,
                categoria: form.categoria || null,
            };
            await updateHistoria(historiaId, payload);
            setForm((prev) => ({ ...prev, publicada: false }));
            toast.success('Historia movida a borrador');
        } catch {
            toast.error('Error al despublicar');
        } finally {
            setGuardando(false);
        }
    };

    const portadaSeleccionada = portadas.find((p) => p.id === Number(form.id_portada));
    const portadaSrc = portadaSeleccionada
        ? (portadaSeleccionada.imagen_base64_display
            ? `data:image/png;base64,${portadaSeleccionada.imagen_base64_display}`
            : portadaSeleccionada.url
                ? `http://localhost:8000${portadaSeleccionada.url}`
                : null)
        : null;

    return (
        <form onSubmit={handleGuardar}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Columna izquierda: portada */}
                <div style={{ width: 240, flexShrink: 0 }}>
                    <p style={labelStyle}>Imagen de Portada</p>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePortadaChange} />

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: '2px dashed var(--border)', borderRadius: 10,
                            overflow: 'hidden', position: 'relative', cursor: 'pointer',
                            background: 'var(--surface-2)',
                            ...(portadaSrc && !imgError
                                ? {}
                                : { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }
                            ),
                        }}
                    >
                        {portadaSrc && !imgError && (
                            <img src={portadaSrc} alt="Portada" onError={() => setImgError(true)}
                                style={{ display: 'block', width: '100%', height: 'auto' }} />
                        )}

                        {subiendoPortada && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            </div>
                        )}

                        {(!portadaSrc || imgError) && !subiendoPortada && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                                {imgError ? (
                                    <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--red)' }}>No se pudo cargar</span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Haz clic para subir otra</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Haz clic para subir portada</span>
                                    </>
                                )}
                            </div>
                        )}

                        {portadaSrc && !imgError && !subiendoPortada && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                                <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cambiar imagen</span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <label style={labelStyle}>O seleccionar existente</label>
                        <select name="id_portada" value={form.id_portada} onChange={handleChange} disabled={guardando} style={selectStyle}>
                            <option value="">-- Sin portada --</option>
                            {portadas.map((p) => (
                                <option key={p.id} value={p.id}>{p.descripcion || `Portada ${p.id}`}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Columna derecha: formulario */}
                <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Título de la Novela *</label>
                        <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required disabled={guardando}
                            placeholder="Ej. El Misterio del Edificio A" style={inputStyle} />
                        {errores.titulo && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errores.titulo.join(', ')}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Categoría</label>
                            <select
                                name="categoria"
                                value={form.categoria}
                                onChange={handleChange}
                                disabled={guardando}
                                style={selectStyle}
                            >
                                <option value="">-- Sin categoría --</option>
                                {categorias.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Estado</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 42 }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', height: 28,
                                    padding: '0 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                                    background: form.publicada ? 'var(--green-bg)' : '#fef9c3',
                                    color: form.publicada ? 'var(--green)' : '#92400e',
                                    border: `1px solid ${form.publicada ? 'var(--green)' : '#fde68a'}`,
                                }}>
                                    {form.publicada ? 'Publicado' : 'Borrador'}
                                </span>
                                {historiaId && (
                                    form.publicada ? (
                                        <button type="button" onClick={handleDespublicar} disabled={guardando}
                                            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                                            Despublicar
                                        </button>
                                    ) : (
                                        <button type="button" onClick={handlePublicar} disabled={guardando}
                                            style={{ background: 'var(--green)', border: 'none', color: '#fff', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                            Publicar
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Sinopsis / Prólogo</label>
                        <textarea name="descripcion" rows={5} value={form.descripcion} onChange={handleChange}
                            disabled={guardando} placeholder="Este texto se mostrará en la introducción de tu historia..."
                            style={{ ...inputStyle, height: 'auto', resize: 'vertical' }} />
                    </div>

                    {historiaId && nodos.length > 0 && (
                        <div>
                            <label style={labelStyle}>Nodo de inicio</label>
                            <select name="id_nodo_inicio" value={form.id_nodo_inicio} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin nodo de inicio --</option>
                                {nodos.map((n) => (
                                    <option key={n.id} value={n.id}>{n.titulo_nodo} (ID {n.id})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!form.publicada && historiaId && (
                        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <p style={{ color: '#92400e', fontSize: '0.84rem', margin: 0 }}>Tu historia está en modo borrador. Solo tú puedes verla.</p>
                            <button type="button" onClick={handlePublicar} disabled={guardando}
                                style={{ background: 'var(--green)', border: 'none', color: '#fff', borderRadius: 8, padding: '5px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                Publicar ahora
                            </button>
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                        <button type="submit" disabled={guardando} style={btnPrimary}>
                            {guardando ? 'Guardando...' : historiaId ? 'Guardar cambios' : 'Guardar y Continuar'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
