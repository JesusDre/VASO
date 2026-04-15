import { useState, useEffect } from 'react';
import { readUsuarios, readRoles, deleteUsuario } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import toast from 'react-hot-toast';
import ModalAlert from '../../../../components/ModalAlert';
import Spinner from './Spinner';
import Empty from './Empty';

export default function TabUsuarios() {
    const { usuario: currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const [ru, rr] = await Promise.all([readUsuarios(), readRoles()]);
            setUsuarios(ru.data);
            setRoles(rr.data);
        } catch { toast.error('Error al cargar usuarios'); }
        finally { setCargando(false); }
    };

    const toggleActivo = async (u) => {
        const tid = toast.loading(u.activo ? 'Desactivando...' : 'Activando...');
        try {
            const res = await fetch(`http://localhost:8000/api/usuarios/${u.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ activo: !u.activo }),
            });
            if (!res.ok) throw new Error();
            toast.success(u.activo ? 'Usuario desactivado' : 'Usuario activado', { id: tid });
            cargar();
        } catch { toast.error('Error al cambiar estado', { id: tid }); }
    };

    const handleEliminar = (id) => setConfirmDelete(id);

    const ejecutarEliminar = async () => {
        const id = confirmDelete;
        setConfirmDelete(null);
        const tid = toast.loading('Eliminando...');
        try {
            await deleteUsuario(id);
            toast.success('Usuario eliminado', { id: tid });
            cargar();
        } catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const nombreRol = (id) => roles.find((r) => r.id === id)?.nombre_rol || '—';

    const filtrados = usuarios
        .filter((u) => currentUser ? u.id !== currentUser.id : true)
        .filter((u) =>
            `${u.nombre} ${u.apellido_paterno} ${u.email}`.toLowerCase().includes(filtro.toLowerCase())
        );

    return (
        <div>
            <input
                type="text" value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="nv-input"
                style={{ maxWidth: 360, marginBottom: 20 }}
            />

            {cargando ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}><Spinner /></div>
            ) : filtrados.length === 0 ? (
                <Empty texto="Sin resultados." />
            ) : (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                {['Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map((h) => (
                                    <th key={h} style={{
                                        padding: '10px 18px', textAlign: 'left',
                                        fontSize: '0.72rem', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.07em',
                                        color: 'var(--text-muted)',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((u) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '13px 18px', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
                                        {u.nombre} {u.apellido_paterno}
                                    </td>
                                    <td style={{ padding: '13px 18px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {u.email}
                                    </td>
                                    <td style={{ padding: '13px 18px' }}>
                                        <span className="nv-badge nv-badge-blue">{nombreRol(u.id_rol)}</span>
                                    </td>
                                    <td style={{ padding: '13px 18px' }}>
                                        <span
                                            className={`nv-badge ${u.activo ? 'nv-badge-green' : ''}`}
                                            style={!u.activo ? { background: 'var(--red-bg)', color: 'var(--red)' } : {}}
                                        >
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 18px' }}>
                                        <div style={{ display: 'inline-flex', gap: 8 }}>
                                            <button onClick={() => toggleActivo(u)} style={{
                                                height: 30, padding: '0 12px',
                                                border: '1px solid var(--border)', borderRadius: 6,
                                                background: 'var(--surface)', color: 'var(--text-muted)',
                                                fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                                            }}>
                                                {u.activo ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button onClick={() => handleEliminar(u.id)} style={{
                                                height: 30, padding: '0 12px',
                                                border: '1px solid var(--red)', borderRadius: 6,
                                                background: 'var(--red-bg)', color: 'var(--red)',
                                                fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                                            }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ModalAlert
                open={!!confirmDelete}
                type="warning"
                title="¿Eliminar usuario?"
                message="Se eliminará este usuario permanentemente. Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onClose={(ok) => { if (ok) ejecutarEliminar(); else setConfirmDelete(null); }}
            />
        </div>
    );
}
