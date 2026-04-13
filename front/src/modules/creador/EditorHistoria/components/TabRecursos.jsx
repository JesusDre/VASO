import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    readImagenes, createImagen, updateImagen, deleteImagen,
    readAudios, createAudio, updateAudio, deleteAudio,
} from '../../../../services/api';
import { inputStyle, labelStyle, selectStyle, btnPrimary, cardStyle } from '../styles/editorStyles';
import Modal from './Modal';

const tipoLabel = { escenario: 'Fondo', personaje: 'Personaje', portada: 'Portada' };
const tipoBadgeBg = { escenario: '#dbeafe', personaje: '#ede9fe', portada: '#fee2e2' };
const tipoBadgeColor = { escenario: '#1d4ed8', personaje: '#6d28d9', portada: '#dc2626' };

export default function TabRecursos() {
    const [imagenes, setImagenes] = useState([]);
    const [audios, setAudios] = useState([]);
    const [subiendo, setSubiendo] = useState(false);
    const [imgFile, setImgFile] = useState(null);
    const [imgTipo, setImgTipo] = useState('escenario');
    const [imgDesc, setImgDesc] = useState('');
    const [audFile, setAudFile] = useState(null);
    const [audDesc, setAudDesc] = useState('');
    const [seccion, setSeccion] = useState('imagenes');

    const [filtroTipo, setFiltroTipo] = useState('todos');

    const [modalEliminar, setModalEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [modalEditar, setModalEditar] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [guardandoEdit, setGuardandoEdit] = useState(false);

    const cargar = async () => {
        const [ri, ra] = await Promise.all([readImagenes(), readAudios()]);
        setImagenes(ri.data);
        setAudios(ra.data);
    };

    useEffect(() => { cargar(); }, []);

    const subirImagen = async (e) => {
        e.preventDefault();
        if (!imgFile) { toast.error('Selecciona un archivo'); return; }
        setSubiendo(true);
        const fd = new FormData();
        fd.append('imagen_para_binario', imgFile);
        fd.append('tipo', imgTipo);
        fd.append('descripcion', imgDesc);
        try {
            await createImagen(fd);
            toast.success('Imagen subida');
            setImgFile(null); setImgDesc('');
            e.target.reset(); cargar();
        } catch { toast.error('Error al subir imagen'); }
        finally { setSubiendo(false); }
    };

    const subirAudio = async (e) => {
        e.preventDefault();
        if (!audFile) { toast.error('Selecciona un archivo'); return; }
        setSubiendo(true);
        const fd = new FormData();
        fd.append('archivo', audFile);
        fd.append('descripcion', audDesc);
        try {
            await createAudio(fd);
            toast.success('Audio subido');
            setAudFile(null); setAudDesc('');
            e.target.reset(); cargar();
        } catch { toast.error('Error al subir audio'); }
        finally { setSubiendo(false); }
    };

    const abrirEliminar = (id, nombre, tipo) => setModalEliminar({ id, nombre, tipo });

    const confirmarEliminar = async () => {
        setEliminando(true);
        try {
            if (modalEliminar.tipo === 'imagen') await deleteImagen(modalEliminar.id);
            else await deleteAudio(modalEliminar.id);
            toast.success(`${modalEliminar.tipo === 'imagen' ? 'Imagen' : 'Audio'} eliminado`);
            setModalEliminar(null); cargar();
        } catch { toast.error('Error al eliminar'); }
        finally { setEliminando(false); }
    };

    const abrirEditar = (item, tipo) => {
        setModalEditar({ item, tipo });
        setEditForm(tipo === 'imagen'
            ? { descripcion: item.descripcion || '', tipo: item.tipo }
            : { descripcion: item.descripcion || '' }
        );
    };

    const confirmarEditar = async (e) => {
        e.preventDefault();
        setGuardandoEdit(true);
        try {
            if (modalEditar.tipo === 'imagen') await updateImagen(modalEditar.item.id, editForm);
            else await updateAudio(modalEditar.item.id, editForm);
            toast.success('Recurso actualizado');
            setModalEditar(null); cargar();
        } catch { toast.error('Error al guardar'); }
        finally { setGuardandoEdit(false); }
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['imagenes', 'audios'].map((s) => (
                    <button key={s} onClick={() => setSeccion(s)} style={{
                        background: seccion === s ? 'var(--accent-light)' : 'transparent',
                        border: '1px solid ' + (seccion === s ? 'var(--accent)' : 'var(--border)'),
                        color: seccion === s ? 'var(--accent)' : 'var(--text-muted)',
                        borderRadius: 8, padding: '6px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
                    }}>
                        {s === 'imagenes' ? 'Imágenes' : 'Audios'}
                    </button>
                ))}
            </div>

            {seccion === 'imagenes' && (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                    <div style={cardStyle}>
                        <h6 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Subir imagen</h6>
                        <form onSubmit={subirImagen}>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Tipo de imagen</label>
                                <select value={imgTipo} onChange={(e) => setImgTipo(e.target.value)} style={selectStyle}>
                                    <option value="escenario">Fondo de escena</option>
                                    <option value="personaje">Sprite de personaje</option>
                                    <option value="portada">Portada de historia</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Descripción</label>
                                <input type="text" value={imgDesc} onChange={(e) => setImgDesc(e.target.value)} placeholder="Ej: Bosque nocturno" style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Archivo (PNG, JPG, WebP)</label>
                                <input type="file" accept="image/*" onChange={(e) => setImgFile(e.target.files[0])} style={{ ...inputStyle, padding: '6px 10px' }} />
                            </div>
                            <button type="submit" disabled={subiendo} style={{ ...btnPrimary, width: '100%' }}>
                                {subiendo ? 'Subiendo...' : 'Subir imagen'}
                            </button>
                        </form>
                    </div>

                    <div>
                        {/* Sub-tabs de categoría */}
                        {(() => {
                            const FILTROS = [
                                { key: 'todos',     label: 'Todas',    color: null },
                                { key: 'portada',   label: 'Portadas', color: tipoBadgeColor.portada },
                                { key: 'personaje', label: 'Sprites',  color: tipoBadgeColor.personaje },
                                { key: 'escenario', label: 'Fondos',   color: tipoBadgeColor.escenario },
                            ];
                            const imgsFiltradas = filtroTipo === 'todos' ? imagenes : imagenes.filter(i => i.tipo === filtroTipo);
                            return (
                                <>
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                                        {FILTROS.map(({ key, label, color }) => {
                                            const activo = filtroTipo === key;
                                            const count = key === 'todos' ? imagenes.length : imagenes.filter(i => i.tipo === key).length;
                                            return (
                                                <button key={key} onClick={() => setFiltroTipo(key)} style={{
                                                    height: 30, padding: '0 14px', borderRadius: 20, cursor: 'pointer',
                                                    border: `1px solid ${activo ? (color || 'var(--accent)') : 'var(--border)'}`,
                                                    background: activo ? (color ? `${color}18` : 'var(--accent-light)') : 'var(--surface)',
                                                    color: activo ? (color || 'var(--accent)') : 'var(--text-muted)',
                                                    fontWeight: activo ? 700 : 500, fontSize: '0.82rem',
                                                    transition: 'all 0.15s',
                                                }}>
                                                    {label} <span style={{ opacity: 0.7 }}>({count})</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {imgsFiltradas.length === 0 && (
                                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>
                                                {imagenes.length === 0 ? 'Sin imágenes. Sube la primera.' : 'Sin imágenes en esta categoría.'}
                                            </p>
                                        )}
                                        {imgsFiltradas.map((img) => {
                                            const src = img.imagen_base64_display
                                                ? `data:image/png;base64,${img.imagen_base64_display}`
                                                : img.url ? `http://localhost:8000${img.url}` : null;
                                            return (
                                                <div key={img.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <div style={{ width: 60, height: 60, borderRadius: 7, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                        {src
                                                            ? <img src={src} alt={img.descripcion} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '0.65rem' }}>IMG</div>
                                                        }
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {img.descripcion || `Imagen ${img.id}`}
                                                        </div>
                                                        <span style={{ background: tipoBadgeBg[img.tipo] || '#f1f5f9', color: tipoBadgeColor[img.tipo] || 'var(--text-muted)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                                                            {tipoLabel[img.tipo] || img.tipo}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                                        <button onClick={() => abrirEditar(img, 'imagen')} style={{ height: 32, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                                                        <button onClick={() => abrirEliminar(img.id, img.descripcion || `Imagen ${img.id}`, 'imagen')} style={{ height: 32, padding: '0 12px', border: '1px solid var(--red)', borderRadius: 6, background: 'var(--red-bg)', color: 'var(--red)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {seccion === 'audios' && (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                    <div style={cardStyle}>
                        <h6 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Subir audio</h6>
                        <form onSubmit={subirAudio}>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Descripción</label>
                                <input type="text" value={audDesc} onChange={(e) => setAudDesc(e.target.value)} placeholder="Ej: Música de tensión" style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>Archivo (MP3, OGG, WAV)</label>
                                <input type="file" accept="audio/*" onChange={(e) => setAudFile(e.target.files[0])} style={{ ...inputStyle, padding: '6px 10px' }} />
                            </div>
                            <button type="submit" disabled={subiendo} style={{ ...btnPrimary, width: '100%' }}>
                                {subiendo ? 'Subiendo...' : 'Subir audio'}
                            </button>
                        </form>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {audios.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 40, fontSize: '0.9rem' }}>Sin audios. Sube el primero.</p>}
                        {audios.map((a) => (
                            <div key={a.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{a.descripcion || `Audio ${a.id}`}</div>
                                    {a.archivo && (
                                        <audio controls style={{ height: 32, width: '100%' }}>
                                            <source src={`http://localhost:8000${a.archivo}`} />
                                        </audio>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <button onClick={() => abrirEditar(a, 'audio')} style={{ height: 32, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Editar</button>
                                    <button onClick={() => abrirEliminar(a.id, a.descripcion || `Audio ${a.id}`, 'audio')} style={{ height: 32, padding: '0 12px', border: '1px solid var(--red)', borderRadius: 6, background: 'var(--red-bg)', color: 'var(--red)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {modalEliminar && (
                <Modal titulo="Confirmar eliminación" onClose={() => !eliminando && setModalEliminar(null)} ancho={400}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 24 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--red-bg)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>¿Eliminar "{modalEliminar.nombre}"?</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Esta acción no se puede deshacer. El recurso se eliminará permanentemente.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={() => setModalEliminar(null)} disabled={eliminando} style={{ height: 36, padding: '0 18px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}>Cancelar</button>
                        <button onClick={confirmarEliminar} disabled={eliminando} style={{ height: 36, padding: '0 18px', border: 'none', borderRadius: 8, background: 'var(--red)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                            {eliminando ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </Modal>
            )}

            {modalEditar && (
                <Modal titulo={`Editar ${modalEditar.tipo === 'imagen' ? 'imagen' : 'audio'}`} onClose={() => !guardandoEdit && setModalEditar(null)} ancho={420}>
                    <form onSubmit={confirmarEditar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Descripción</label>
                            <input type="text" value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                                placeholder="Descripción del recurso" style={inputStyle} autoFocus />
                        </div>
                        {modalEditar.tipo === 'imagen' && (
                            <div>
                                <label style={labelStyle}>Tipo de imagen</label>
                                <select value={editForm.tipo} onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })} style={selectStyle}>
                                    <option value="escenario">Fondo de escena</option>
                                    <option value="personaje">Sprite de personaje</option>
                                    <option value="portada">Portada de historia</option>
                                </select>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                            <button type="button" onClick={() => setModalEditar(null)} disabled={guardandoEdit} style={{ height: 36, padding: '0 18px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}>Cancelar</button>
                            <button type="submit" disabled={guardandoEdit} style={{ height: 36, padding: '0 18px', border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                                {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
