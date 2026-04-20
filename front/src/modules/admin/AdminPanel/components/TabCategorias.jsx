import { useState, useEffect } from 'react';
import { readCategorias, createCategoria, updateCategoria } from '../../../../services/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import Empty from './Empty';

const FORM_VACIO = { nombre: '', descripcion: '' };

export default function TabCategorias() {
    const [categorias, setCategorias]   = useState([]);
    const [cargando, setCargando]       = useState(true);
    const [form, setForm]               = useState(FORM_VACIO);
    const [editandoId, setEditandoId]   = useState(null);
    const [guardando, setGuardando]     = useState(false);
    const [modoFormulario, setModoFormulario] = useState(false);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const res = await readCategorias();
            setCategorias(res.data);
        } catch {
            toast.error('Error al cargar categorías');
        } finally {
            setCargando(false);
        }
    };

    const abrirCrear = () => {
        setForm(FORM_VACIO);
        setEditandoId(null);
        setModoFormulario(true);
    };

    const abrirEditar = (cat) => {
        setForm({ nombre: cat.nombre, descripcion: cat.descripcion });
        setEditandoId(cat.id);
        setModoFormulario(true);
    };

    const cancelar = () => {
        setModoFormulario(false);
        setForm(FORM_VACIO);
        setEditandoId(null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }
        setGuardando(true);
        const tid = toast.loading(editandoId ? 'Guardando cambios...' : 'Creando categoría...');
        try {
            if (editandoId) {
                await updateCategoria(editandoId, { ...form, activa: true });
                toast.success('Categoría actualizada', { id: tid });
            } else {
                await createCategoria({ ...form, activa: true });
                toast.success('Categoría creada', { id: tid });
            }
            cancelar();
            cargar();
        } catch (err) {
            const msg = err.response?.data?.nombre?.[0] || 'Error al guardar';
            toast.error(msg, { id: tid });
        } finally {
            setGuardando(false);
        }
    };

    const handleDesactivar = async (cat) => {
        const tid = toast.loading('Desactivando categoría...');
        try {
            await updateCategoria(cat.id, { ...cat, activa: false });
            toast.success('Categoría desactivada', { id: tid });
            cargar();
        } catch {
            toast.error('Error al desactivar', { id: tid });
        }
    };

    const inputStyle = {
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--text)', fontSize: '0.9rem', boxSizing: 'border-box',
    };

    const labelStyle = {
        display: 'block', fontSize: '0.8rem', fontWeight: 600,
        color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };

    let submitButtonLabel;
    if (guardando) submitButtonLabel = 'Guardando...';
    else if (editandoId) submitButtonLabel = 'Guardar cambios';
    else submitButtonLabel = 'Crear';

    let categoriasContent;
    if (cargando) {
        categoriasContent = <div style={{ textAlign: 'center', padding: '3rem 0' }}><Spinner /></div>;
    } else if (categorias.length === 0) {
        categoriasContent = <Empty texto="No hay categorías activas. Crea la primera." />;
    } else {
        categoriasContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categorias.map((cat) => (
                <div key={cat.id} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.93rem' }}>
                            {cat.nombre}
                        </span>
                        {cat.descripcion && (
                            <p style={{
                                color: 'var(--text-muted)', fontSize: '0.82rem',
                                marginTop: 2, margin: 0,
                            }}>
                                {cat.descripcion}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => abrirEditar(cat)} style={{
                            height: 32, padding: '0 14px', borderRadius: 7,
                            border: '1px solid var(--border)', background: 'var(--surface)',
                            color: 'var(--text)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        }}>
                            Editar
                        </button>
                        <button onClick={() => handleDesactivar(cat)} style={{
                            height: 32, padding: '0 14px', borderRadius: 7,
                            border: '1px solid var(--red)', background: 'var(--red-bg)',
                            color: 'var(--red)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        }}>
                            Desactivar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    ));

    return (
        <div>
            {/* Cabecera */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    {categorias.length} categoría{categorias.length === 1 ? '' : 's'} activa{categorias.length === 1 ? '' : 's'}
                </p>
                {!modoFormulario && (
                    <button onClick={abrirCrear} style={{
                        height: 34, padding: '0 16px', borderRadius: 8,
                        background: 'var(--accent)', border: 'none',
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    }}>
                        + Nueva categoría
                    </button>
                )}
            </div>

            {/* Formulario crear/editar */}
            {modoFormulario && (
                <form onSubmit={handleGuardar} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '20px', marginBottom: 20,
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, color: 'var(--text)' }}>
                        {editandoId ? 'Editar categoría' : 'Nueva categoría'}
                    </p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label htmlFor="cat-nombre" style={labelStyle}>Nombre *</label>
                            <input
                                id="cat-nombre"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej. Terror"
                                disabled={guardando}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ flex: 2, minWidth: 260 }}>
                            <label htmlFor="cat-descripcion" style={labelStyle}>Descripción</label>
                            <input
                                id="cat-descripcion"
                                name="descripcion"
                                value={form.descripcion}
                                onChange={handleChange}
                                placeholder="Breve descripción de la categoría"
                                disabled={guardando}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button type="submit" disabled={guardando} style={{
                            height: 34, padding: '0 18px', borderRadius: 8,
                            background: 'var(--accent)', border: 'none',
                            color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                        }}>
                            {submitButtonLabel}
                        </button>
                        <button type="button" onClick={cancelar} disabled={guardando} style={{
                            height: 34, padding: '0 16px', borderRadius: 8,
                            background: 'none', border: '1px solid var(--border)',
                            color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer',
                        }}>
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Listado */}
            {categoriasContent}
        </div>
    );
}
