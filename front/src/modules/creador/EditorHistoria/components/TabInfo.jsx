import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    createHistoria, updateHistoria,
    readNodos, readMisImagenes, createMiImagen, readCategorias, readOpciones,
} from '../../../../services/api';
import { inputStyle, labelStyle, selectStyle, btnPrimary } from '../styles/editorStyles';
import ModalAlert from '../../../../components/ModalAlert';

function extraerMensajeError(err, fallback) {
    const data = err.response?.data;
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    const mensajes = Object.values(data).flat();
    return mensajes.length > 0 ? mensajes[0] : fallback;
}

function ItemChecklist({ ok, label, hint, advertencia }) {
    let icono, colorTexto;
    if (advertencia) {
        icono = (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        );
        colorTexto = '#92400e';
    } else if (ok) {
        icono = (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        );
        colorTexto = 'var(--text)';
    } else {
        icono = (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
        );
        colorTexto = 'var(--text-muted)';
    }

    return (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: advertencia ? '#fef9c3' : ok ? 'var(--green-bg)' : 'var(--surface-2)',
                border: `1px solid ${advertencia ? '#fde68a' : ok ? 'var(--green)' : 'var(--border)'}`,
            }}>
                {icono}
            </div>
            <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: colorTexto }}>{label}</div>
                {hint && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{hint}</div>}
            </div>
        </div>
    );
}

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
    const [opciones, setOpciones] = useState([]);
    const [portadas, setPortadas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});
    const [subiendoPortada, setSubiendoPortada] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [alerta, setAlerta] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (historiaId) {
            Promise.all([readNodos(), readOpciones()]).then(([rn, ro]) => {
                const nodosHistoria = rn.data.filter(n => Number(n.id_historia) === Number(historiaId));
                setNodos(nodosHistoria);
                const nodosSet = new Set(nodosHistoria.map(n => n.id));
                setOpciones(ro.data.filter(o => nodosSet.has(o.id_nodo_origen)));
            }).catch(() => {});
        }
        readMisImagenes().then(r => setPortadas(r.data.filter(i => i.tipo === 'portada'))).catch(() => {});
        readCategorias().then(r => setCategorias(r.data)).catch(() => {});
    }, [historiaId]);

    useEffect(() => { setImgError(false); }, [form.id_portada]);

    // Computed: requisitos de publicación
    const nodoIdsConOpciones = new Set(opciones.map(o => o.id_nodo_origen));
    const nodosHuerfanos = nodos.filter(n => !n.es_final && !nodoIdsConOpciones.has(n.id));
    const puedePublicar = form.titulo.trim().length > 0
        && nodos.length > 0
        && !!form.id_nodo_inicio
        && nodosHuerfanos.length === 0;

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
            const res = await createMiImagen(fd);
            const nuevaPortada = res.data;
            setPortadas(prev => [...prev, nuevaPortada]);
            setForm(prev => ({ ...prev, id_portada: nuevaPortada.id }));
            toast.success('Portada subida');
        } catch (err) {
            setAlerta({ type: 'error', title: 'No se pudo subir la portada', message: extraerMensajeError(err, 'Error al subir la portada') });
        } finally {
            setSubiendoPortada(false);
            e.target.value = '';
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setErrores({});
        if (historiaId && nodos.length > 0 && !form.id_nodo_inicio) {
            setErrores({ id_nodo_inicio: 'Selecciona la escena con la que comenzará la historia.' });
            return;
        }
        setGuardando(true);
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
                toast.success('¡Historia creada! Ahora sube tus recursos.');
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
        if (!puedePublicar) {
            const problemas = [];
            if (!form.titulo.trim()) problemas.push('Define el título de la historia.');
            if (nodos.length === 0) problemas.push('Crea al menos una escena en la pestaña Escenas.');
            if (!form.id_nodo_inicio) problemas.push('Selecciona la escena de inicio.');
            if (nodosHuerfanos.length > 0)
                problemas.push(`${nodosHuerfanos.length} escena(s) no tienen decisiones ni están marcadas como final: ${nodosHuerfanos.map(n => `"${n.titulo_nodo}"`).join(', ')}.`);
            setAlerta({
                type: 'warning',
                title: 'Completa los requisitos primero',
                message: problemas[0],
            });
            return;
        }
        setGuardando(true);
        try {
            await updateHistoria(historiaId, {
                titulo: form.titulo, descripcion: form.descripcion, publicada: true,
                id_creador: usuario.id, id_nodo_inicio: form.id_nodo_inicio || null,
                id_portada: form.id_portada || null, categoria: form.categoria || null,
            });
            setForm(prev => ({ ...prev, publicada: true }));
            toast.success('¡Historia publicada! Ya está disponible para los lectores.');
        } catch {
            toast.error('Error al publicar');
        } finally {
            setGuardando(false);
        }
    };

    const handleDespublicar = async () => {
        setGuardando(true);
        try {
            await updateHistoria(historiaId, {
                titulo: form.titulo, descripcion: form.descripcion, publicada: false,
                id_creador: usuario.id, id_nodo_inicio: form.id_nodo_inicio || null,
                id_portada: form.id_portada || null, categoria: form.categoria || null,
            });
            setForm(prev => ({ ...prev, publicada: false }));
            toast.success('Historia movida a borrador');
        } catch {
            toast.error('Error al despublicar');
        } finally {
            setGuardando(false);
        }
    };

    const portadaSeleccionada = portadas.find(p => p.id === Number(form.id_portada));
    const portadaSrc = portadaSeleccionada
        ? (portadaSeleccionada.imagen_base64_display
            ? `data:image/png;base64,${portadaSeleccionada.imagen_base64_display}`
            : portadaSeleccionada.url ? `http://localhost:8000${portadaSeleccionada.url}` : null)
        : null;

    return (
        <>
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
                            ...(portadaSrc && !imgError ? {} : { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
                        }}
                    >
                        {portadaSrc && !imgError && (
                            <img src={portadaSrc} alt="Portada" onError={() => setImgError(true)} style={{ display: 'block', width: '100%', height: 'auto' }} />
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
                                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--red)' }}>No se pudo cargar</span>
                                        <span style={{ fontSize: '0.72rem' }}>Haz clic para subir otra</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                        </svg>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Haz clic para subir portada</span>
                                    </>
                                )}
                            </div>
                        )}
                        {portadaSrc && !imgError && !subiendoPortada && (
                            <div
                                style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                onMouseLeave={e => e.currentTarget.style.opacity = 0}
                            >
                                <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cambiar imagen</span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <label style={labelStyle}>O seleccionar existente</label>
                        <select name="id_portada" value={form.id_portada} onChange={handleChange} disabled={guardando} style={selectStyle}>
                            <option value="">-- Sin portada --</option>
                            {portadas.map(p => <option key={p.id} value={p.id}>{p.descripcion || `Portada ${p.id}`}</option>)}
                        </select>
                    </div>

                    {/* Checklist de publicación */}
                    {historiaId && !form.publicada && (
                        <div style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                            <p style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 4 }}>
                                Para publicar
                            </p>
                            <div style={{ borderTop: '1px solid var(--border)' }}>
                                <ItemChecklist
                                    ok={form.titulo.trim().length > 0}
                                    label="Título definido"
                                    hint={!form.titulo.trim() ? 'Escribe el nombre de tu historia.' : undefined}
                                />
                                <ItemChecklist
                                    ok={nodos.length > 0}
                                    label={nodos.length > 0 ? `${nodos.length} escena${nodos.length > 1 ? 's' : ''} creada${nodos.length > 1 ? 's' : ''}` : 'Al menos 1 escena'}
                                    hint={nodos.length === 0 ? 'Ve a la pestaña Escenas.' : undefined}
                                />
                                <ItemChecklist
                                    ok={!!form.id_nodo_inicio}
                                    label="Escena de inicio seleccionada"
                                    hint={!form.id_nodo_inicio ? 'Elige la escena con la que empieza.' : undefined}
                                />
                                {nodosHuerfanos.length > 0 && (
                                    <ItemChecklist
                                        ok={false}
                                        advertencia
                                        label={`${nodosHuerfanos.length} escena${nodosHuerfanos.length > 1 ? 's' : ''} sin salida`}
                                        hint={`El lector quedaría bloqueado en: ${nodosHuerfanos.map(n => `"${n.titulo_nodo}"`).join(', ')}`}
                                    />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handlePublicar}
                                disabled={guardando || !puedePublicar}
                                style={{
                                    marginTop: 12, width: '100%',
                                    background: puedePublicar ? 'var(--green)' : 'var(--surface-2)',
                                    border: `1px solid ${puedePublicar ? 'var(--green)' : 'var(--border)'}`,
                                    color: puedePublicar ? '#fff' : 'var(--text-muted)',
                                    borderRadius: 8, padding: '8px 0',
                                    cursor: puedePublicar ? 'pointer' : 'not-allowed',
                                    fontWeight: 600, fontSize: '0.88rem',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {guardando ? 'Publicando...' : puedePublicar ? 'Publicar historia' : 'Completa los requisitos'}
                            </button>
                        </div>
                    )}

                    {historiaId && form.publicada && (
                        <div style={{ marginTop: 20, background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 10, padding: '14px 16px' }}>
                            <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.88rem', margin: '0 0 4px' }}>Historia publicada</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 10px' }}>Los lectores ya pueden verla.</p>
                            <button type="button" onClick={handleDespublicar} disabled={guardando}
                                style={{ width: '100%', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, padding: '7px 0', cursor: 'pointer', fontWeight: 500, fontSize: '0.84rem' }}>
                                Mover a borrador
                            </button>
                        </div>
                    )}
                </div>

                {/* Columna derecha: formulario */}
                <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Título de la Historia *</label>
                        <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required disabled={guardando}
                            placeholder="Ej. El Misterio del Edificio A" style={inputStyle} />
                        {errores.titulo && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errores.titulo.join(', ')}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Categoría</label>
                            <select name="categoria" value={form.categoria} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin categoría --</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Estado</label>
                            <div style={{ display: 'flex', alignItems: 'center', height: 42 }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', height: 28,
                                    padding: '0 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                                    background: form.publicada ? 'var(--green-bg)' : '#fef9c3',
                                    color: form.publicada ? 'var(--green)' : '#92400e',
                                    border: `1px solid ${form.publicada ? 'var(--green)' : '#fde68a'}`,
                                }}>
                                    {form.publicada ? 'Publicado' : 'Borrador'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Sinopsis / Prólogo</label>
                        <textarea name="descripcion" rows={5} value={form.descripcion} onChange={handleChange}
                            disabled={guardando} placeholder="Este texto se mostrará al inicio de la historia..."
                            style={{ ...inputStyle, height: 'auto', resize: 'vertical' }} />
                    </div>

                    {historiaId && nodos.length > 0 && (
                        <div>
                            <label style={labelStyle}>Escena de inicio *</label>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 6px' }}>
                                La primera escena que verá el lector al comenzar la historia.
                            </p>
                            <select name="id_nodo_inicio" value={form.id_nodo_inicio} onChange={handleChange} disabled={guardando}
                                style={{ ...selectStyle, ...(errores.id_nodo_inicio ? { borderColor: 'var(--red)' } : {}) }}>
                                <option value="">-- Selecciona una escena --</option>
                                {nodos.map(n => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                            </select>
                            {errores.id_nodo_inicio && (
                                <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errores.id_nodo_inicio}</p>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                        <button type="submit" disabled={guardando} style={btnPrimary}>
                            {guardando ? 'Guardando...' : historiaId ? 'Guardar cambios' : 'Guardar y Continuar →'}
                        </button>
                    </div>
                </div>
            </div>
        </form>

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
