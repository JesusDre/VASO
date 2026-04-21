import React from 'react';
import { useState, useEffect } from 'react';
import { readRoles, createRol, updateRol, deleteRol } from '../../../../services/api';
import toast from 'react-hot-toast';
import ModalAlert from '../../../../components/ModalAlert';
import Spinner from './Spinner';
import Empty from './Empty';

export default function TabRoles() {
    const FORM = { nombre_rol: '' };
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState(FORM);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try { setRoles((await readRoles()).data); }
        catch { toast.error('Error al cargar roles'); }
        finally { setCargando(false); }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            if (editandoId) { await updateRol(editandoId, form); toast.success('Rol actualizado'); }
            else { await createRol(form); toast.success('Rol creado'); }
            setForm(FORM); setEditandoId(null); cargar();
        } catch { toast.error('Error al guardar'); }
        finally { setGuardando(false); }
    };

    const editar = (r) => { setForm({ nombre_rol: r.nombre_rol }); setEditandoId(r.id); };

    const eliminar = (id) => setConfirmDelete(id);

    const ejecutarEliminar = async () => {
        const id = confirmDelete;
        setConfirmDelete(null);
        try { await deleteRol(id); toast.success('Rol eliminado'); cargar(); }
        catch { toast.error('Error al eliminar'); }
    };

    let rolSubmitLabel;
    if (guardando) rolSubmitLabel = '...';
    else if (editandoId) rolSubmitLabel = 'Actualizar';
    else rolSubmitLabel = 'Crear';

    let rolesContent;
    if (cargando) {
        rolesContent = <div style={{ textAlign: 'center', padding: '2rem 0' }}><Spinner /></div>;
    } else if (roles.length === 0) {
        rolesContent = <Empty texto="Sin roles configurados." />;
    } else {
        rolesContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {roles.map((r) => (
                <div key={r.id} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '13px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <div>
                        <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.92rem' }}>{r.nombre_rol}</span>

                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => editar(r)} style={{
                            height: 30, padding: '0 12px',
                            border: '1px solid var(--border)', borderRadius: 6,
                            background: 'var(--yellow-bg)', color: 'var(--yellow)',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        }}>
                            Editar
                        </button>
                        <button onClick={() => eliminar(r.id)} style={{
                            height: 30, padding: '0 12px',
                            border: '1px solid var(--red)', borderRadius: 6,
                            background: 'var(--red-bg)', color: 'var(--red)',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        }}>
                            Eliminar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    ));

    return (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ width: 280, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
                    {editandoId ? 'Editar rol' : 'Nuevo rol'}
                </h3>
                <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label htmlFor="rol-nombre" className="nv-label">Nombre del rol</label>
                        <input
                            id="rol-nombre"
                            type="text" value={form.nombre_rol}
                            onChange={(e) => setForm({ nombre_rol: e.target.value })}
                            required disabled={guardando}
                            placeholder="Ej: administrador, lector"
                            className="nv-input"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={guardando} style={{
                            flex: 1, height: 36,
                            background: 'var(--accent)', border: 'none', color: '#fff',
                            borderRadius: 8, fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                        }}>
                            {rolSubmitLabel}
                        </button>
                        {editandoId && (
                            <button type="button" onClick={() => { setForm(FORM); setEditandoId(null); }} style={{
                                height: 36, padding: '0 14px',
                                background: 'var(--surface-2)', border: '1px solid var(--border)',
                                color: 'var(--text-muted)', borderRadius: 8,
                                cursor: 'pointer', fontSize: '0.88rem',
                            }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
                {rolesContent}
            </div>

            <ModalAlert
                open={!!confirmDelete}
                type="warning"
                title="¿Eliminar rol?"
                message="Se eliminará este rol permanentemente. Los usuarios asignados podrían verse afectados."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onClose={(ok) => { if (ok) ejecutarEliminar(); else setConfirmDelete(null); }}
            />
        </div>
    );
}
