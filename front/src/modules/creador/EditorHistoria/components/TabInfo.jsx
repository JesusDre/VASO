import React from 'react';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import {
    API_BASE, createHistoria, updateHistoria,
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

function construirPayload(form, usuarioId, publicadaOverride) {
    return {
        titulo: form.titulo,
        descripcion: form.descripcion,
        publicada: publicadaOverride ?? form.publicada,
        id_creador: usuarioId,
        id_nodo_inicio: form.id_nodo_inicio || null,
        id_portada: form.id_portada || null,
        categoria: form.categoria || null,
    };
}

function calcularPortadaSrc(portada) {
    if (!portada) return null;
    if (portada.imagen_base64_display) return `data:image/png;base64,${portada.imagen_base64_display}`;
    if (portada.url) return `${API_BASE}${portada.url}`;
    return null;
}

function listarProblemasPublicacion(form, nodos, nodosHuerfanos) {
    const problemas = [];
    if (!form.titulo.trim()) problemas.push('Define el título de la historia.');
    if (nodos.length === 0) problemas.push('Crea al menos una escena en la pestaña Escenas.');
    if (!form.id_nodo_inicio) problemas.push('Selecciona la escena de inicio.');
    if (nodosHuerfanos.length > 0) {
        const nombres = nodosHuerfanos.map(n => `"${n.titulo_nodo}"`).join(', ');
        problemas.push(`${nodosHuerfanos.length} escena(s) no tienen decisiones ni están marcadas como final: ${nombres}.`);
    }
    return problemas;
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

    let bgColor, borderColor2;
    if (advertencia) {
        bgColor = '#fef9c3';
        borderColor2 = '#fde68a';
    } else if (ok) {
        bgColor = 'var(--green-bg)';
        borderColor2 = 'var(--green)';
    } else {
        bgColor = 'var(--surface-2)';
        borderColor2 = 'var(--border)';
    }

    return (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bgColor,
                border: `1px solid ${borderColor2}`,
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

ItemChecklist.propTypes = {
    ok: PropTypes.bool,
    label: PropTypes.string.isRequired,
    hint: PropTypes.string,
    advertencia: PropTypes.bool,
};

function PortadaUploader({ portadaSrc, subiendoPortada, imgError, onImgError, onOpenPicker, onFileChange, guardando, fileInputRef }) {
    const [hov, setHov] = useState(false);
    const tienePortada = !!portadaSrc && !imgError;
    const mostrarPlaceholder = !tienePortada && !subiendoPortada;
    const extraStyle = tienePortada
        ? {}
        : { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' };

    let placeholder = null;
    if (mostrarPlaceholder && imgError) {
        placeholder = (
            <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--red)' }}>No se pudo cargar</span>
                <span style={{ fontSize: '0.72rem' }}>Haz clic para subir otra</span>
            </>
        );
    } else if (mostrarPlaceholder) {
        placeholder = (
            <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Haz clic para subir portada</span>
            </>
        );
    }

    return (
        <>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} disabled={guardando} />
            <button
                type="button"
                onClick={onOpenPicker}
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                    border: '2px dashed var(--border)', borderRadius: 10,
                    overflow: 'hidden', position: 'relative', cursor: 'pointer',
                    background: 'var(--surface-2)', padding: 0, textAlign: 'left', width: '100%',
                    ...extraStyle,
                }}
            >
                {tienePortada && (
                    <img src={portadaSrc} alt="Portada" onError={onImgError} style={{ display: 'block', width: '100%', height: 'auto' }} />
                )}
                {subiendoPortada && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    </div>
                )}
                {placeholder && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                        {placeholder}
                    </div>
                )}
                {tienePortada && !subiendoPortada && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hov ? 1 : 0, transition: 'opacity 0.15s' }}>
                        <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cambiar imagen</span>
                    </div>
                )}
            </button>
        </>
    );
}

PortadaUploader.propTypes = {
    portadaSrc: PropTypes.string,
    subiendoPortada: PropTypes.bool,
    imgError: PropTypes.bool,
    onImgError: PropTypes.func.isRequired,
    onOpenPicker: PropTypes.func.isRequired,
    onFileChange: PropTypes.func.isRequired,
    guardando: PropTypes.bool,
    fileInputRef: PropTypes.shape({ current: PropTypes.any }),
};

function PublishChecklist({ form, nodos, nodosHuerfanos, puedePublicar, guardando, onPublicar }) {
    const tituloHint = form.titulo.trim() ? undefined : 'Escribe el nombre de tu historia.';
    const pluralEscenas = nodos.length > 1 ? 's' : '';
    const escenasLabel = nodos.length > 0
        ? `${nodos.length} escena${pluralEscenas} creada${pluralEscenas}`
        : 'Al menos 1 escena';
    const escenasHint = nodos.length === 0 ? 'Ve a la pestaña Escenas.' : undefined;
    const nodoInicioHint = form.id_nodo_inicio ? undefined : 'Elige la escena con la que empieza.';
    const pluralHuerfanos = nodosHuerfanos.length > 1 ? 's' : '';
    const huerfanosLabel = `${nodosHuerfanos.length} escena${pluralHuerfanos} sin salida`;
    const nombresHuerfanosChecklist = nodosHuerfanos.map(n => `"${n.titulo_nodo}"`).join(', ');
    const huerfanosHint = `El lector quedaría bloqueado en: ${nombresHuerfanosChecklist}`;
    const borderCol = puedePublicar ? 'var(--green)' : 'var(--border)';
    const bg = puedePublicar ? 'var(--green)' : 'var(--surface-2)';
    const color = puedePublicar ? '#fff' : 'var(--text-muted)';
    const cursor = puedePublicar ? 'pointer' : 'not-allowed';

    let texto;
    if (guardando) texto = 'Publicando...';
    else if (puedePublicar) texto = 'Publicar historia';
    else texto = 'Completa los requisitos';

    return (
        <div style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 4 }}>
                Para publicar
            </p>
            <div style={{ borderTop: '1px solid var(--border)' }}>
                <ItemChecklist ok={form.titulo.trim().length > 0} label="Título definido" hint={tituloHint} />
                <ItemChecklist ok={nodos.length > 0} label={escenasLabel} hint={escenasHint} />
                <ItemChecklist ok={!!form.id_nodo_inicio} label="Escena de inicio seleccionada" hint={nodoInicioHint} />
                {nodosHuerfanos.length > 0 && (
                    <ItemChecklist ok={false} advertencia label={huerfanosLabel} hint={huerfanosHint} />
                )}
            </div>
            <button
                type="button"
                onClick={onPublicar}
                disabled={guardando || !puedePublicar}
                style={{
                    marginTop: 12, width: '100%',
                    background: bg, border: `1px solid ${borderCol}`, color,
                    borderRadius: 8, padding: '8px 0', cursor,
                    fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.15s',
                }}
            >
                {texto}
            </button>
        </div>
    );
}

PublishChecklist.propTypes = {
    form: PropTypes.object.isRequired,
    nodos: PropTypes.array.isRequired,
    nodosHuerfanos: PropTypes.array.isRequired,
    puedePublicar: PropTypes.bool.isRequired,
    guardando: PropTypes.bool,
    onPublicar: PropTypes.func.isRequired,
};

function PublishedBanner({ guardando, onDespublicar }) {
    return (
        <div style={{ marginTop: 20, background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.88rem', margin: '0 0 4px' }}>Historia publicada</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 10px' }}>Los lectores ya pueden verla.</p>
            <button type="button" onClick={onDespublicar} disabled={guardando}
                style={{ width: '100%', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, padding: '7px 0', cursor: 'pointer', fontWeight: 500, fontSize: '0.84rem' }}>
                Mover a borrador
            </button>
        </div>
    );
}

PublishedBanner.propTypes = {
    guardando: PropTypes.bool,
    onDespublicar: PropTypes.func.isRequired,
};

function EstadoBadge({ publicada }) {
    const borderCol = publicada ? 'var(--green)' : '#fde68a';
    const bg = publicada ? 'var(--green-bg)' : '#fef9c3';
    const color = publicada ? 'var(--green)' : '#92400e';
    const label = publicada ? 'Publicado' : 'Borrador';
    return (
        <div style={{ display: 'flex', alignItems: 'center', height: 42 }}>
            <span style={{
                display: 'inline-flex', alignItems: 'center', height: 28,
                padding: '0 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                background: bg, color, border: `1px solid ${borderCol}`,
            }}>
                {label}
            </span>
        </div>
    );
}

EstadoBadge.propTypes = { publicada: PropTypes.bool };

function formStateFromHistoria(historia) {
    if (!historia) {
        return { titulo: '', descripcion: '', publicada: false, id_nodo_inicio: '', id_portada: '', categoria: '' };
    }
    return {
        titulo: historia.titulo,
        descripcion: historia.descripcion,
        publicada: historia.publicada,
        id_nodo_inicio: historia.id_nodo_inicio || '',
        id_portada: historia.id_portada || '',
        categoria: historia.categoria || '',
    };
}

function calcularGuardarTexto(guardando, historiaId) {
    if (guardando) return 'Guardando...';
    if (historiaId) return 'Guardar cambios';
    return 'Guardar y Continuar →';
}

function useCargarRecursos(historiaId, setNodos, setOpciones, setPortadas, setCategorias) {
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
    }, [historiaId, setNodos, setOpciones, setPortadas, setCategorias]);
}

function useTabInfoLogic({ historia, historiaId, usuario, onGuardado }) {
    const [form, setForm] = useState(() => formStateFromHistoria(historia));
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

    useCargarRecursos(historiaId, setNodos, setOpciones, setPortadas, setCategorias);
    useEffect(() => { setImgError(false); }, [form.id_portada]);

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
            setPortadas(prev => [...prev, res.data]);
            setForm(prev => ({ ...prev, id_portada: res.data.id }));
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
        const payload = construirPayload(form, usuario.id);
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
            const problemas = listarProblemasPublicacion(form, nodos, nodosHuerfanos);
            setAlerta({ type: 'warning', title: 'Completa los requisitos primero', message: problemas[0] });
            return;
        }
        setGuardando(true);
        try {
            await updateHistoria(historiaId, construirPayload(form, usuario.id, true));
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
            await updateHistoria(historiaId, construirPayload(form, usuario.id, false));
            setForm(prev => ({ ...prev, publicada: false }));
            toast.success('Historia movida a borrador');
        } catch {
            toast.error('Error al despublicar');
        } finally {
            setGuardando(false);
        }
    };

    const portadaSeleccionada = portadas.find(p => p.id === Number(form.id_portada));
    const portadaSrc = calcularPortadaSrc(portadaSeleccionada);

    return {
        form, nodos, portadas, categorias,
        guardando, errores, subiendoPortada, imgError, alerta, fileInputRef,
        nodosHuerfanos, puedePublicar, portadaSrc,
        setImgError, setAlerta,
        handleChange, handlePortadaChange, handleGuardar,
        handlePublicar, handleDespublicar,
    };
}

export default function TabInfo({ historia, historiaId, usuario, onGuardado }) {
    const {
        form, nodos, portadas, categorias,
        guardando, errores, subiendoPortada, imgError, alerta, fileInputRef,
        nodosHuerfanos, puedePublicar, portadaSrc,
        setImgError, setAlerta,
        handleChange, handlePortadaChange, handleGuardar,
        handlePublicar, handleDespublicar,
    } = useTabInfoLogic({ historia, historiaId, usuario, onGuardado });

    const guardarTexto = calcularGuardarTexto(guardando, historiaId);
    const nodoInicioSelectStyle = errores.id_nodo_inicio
        ? { ...selectStyle, borderColor: 'var(--red)' }
        : selectStyle;
    const mostrarChecklist = historiaId && !form.publicada;
    const mostrarBannerPublicada = historiaId && form.publicada;
    const mostrarNodoInicio = historiaId && nodos.length > 0;

    return (
        <>
        <form onSubmit={handleGuardar}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ width: 240, flexShrink: 0 }}>
                    <p style={labelStyle}>Imagen de Portada</p>
                    <PortadaUploader
                        portadaSrc={portadaSrc}
                        subiendoPortada={subiendoPortada}
                        imgError={imgError}
                        onImgError={() => setImgError(true)}
                        onOpenPicker={() => fileInputRef.current?.click()}
                        onFileChange={handlePortadaChange}
                        guardando={guardando}
                        fileInputRef={fileInputRef}
                    />

                    <div style={{ marginTop: 10 }}>
                        <label htmlFor="tabinfo-portada" style={labelStyle}>O seleccionar existente</label>
                        <select id="tabinfo-portada" name="id_portada" value={form.id_portada} onChange={handleChange} disabled={guardando} style={selectStyle}>
                            <option value="">-- Sin portada --</option>
                            {portadas.map(p => <option key={p.id} value={p.id}>{p.descripcion || `Portada ${p.id}`}</option>)}
                        </select>
                    </div>

                    {mostrarChecklist && (
                        <PublishChecklist
                            form={form}
                            nodos={nodos}
                            nodosHuerfanos={nodosHuerfanos}
                            puedePublicar={puedePublicar}
                            guardando={guardando}
                            onPublicar={handlePublicar}
                        />
                    )}

                    {mostrarBannerPublicada && (
                        <PublishedBanner guardando={guardando} onDespublicar={handleDespublicar} />
                    )}
                </div>

                <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label htmlFor="tabinfo-titulo" style={labelStyle}>Título de la Historia *</label>
                        <input id="tabinfo-titulo" type="text" name="titulo" value={form.titulo} onChange={handleChange} required disabled={guardando}
                            placeholder="Ej. El Misterio del Edificio A" style={inputStyle} />
                        {errores.titulo && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errores.titulo.join(', ')}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="tabinfo-categoria" style={labelStyle}>Categoría</label>
                            <select id="tabinfo-categoria" name="categoria" value={form.categoria} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin categoría --</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={labelStyle}>Estado</p>
                            <EstadoBadge publicada={form.publicada} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="tabinfo-descripcion" style={labelStyle}>Sinopsis / Prólogo</label>
                        <textarea id="tabinfo-descripcion" name="descripcion" rows={5} value={form.descripcion} onChange={handleChange}
                            disabled={guardando} placeholder="Este texto se mostrará al inicio de la historia..."
                            style={{ ...inputStyle, height: 'auto', resize: 'vertical' }} />
                    </div>

                    {mostrarNodoInicio && (
                        <div>
                            <label htmlFor="tabinfo-nodo-inicio" style={labelStyle}>Escena de inicio *</label>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 6px' }}>
                                La primera escena que verá el lector al comenzar la historia.
                            </p>
                            <select id="tabinfo-nodo-inicio" name="id_nodo_inicio" value={form.id_nodo_inicio} onChange={handleChange} disabled={guardando}
                                style={nodoInicioSelectStyle}>
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
                            {guardarTexto}
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

TabInfo.propTypes = {
    historia: PropTypes.shape({
        titulo: PropTypes.string,
        descripcion: PropTypes.string,
        publicada: PropTypes.bool,
        id_nodo_inicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        id_portada: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        categoria: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    historiaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    usuario: PropTypes.shape({
        id: PropTypes.number,
    }),
    onGuardado: PropTypes.func,
};
