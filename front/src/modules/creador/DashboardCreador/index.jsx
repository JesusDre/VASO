import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readHistorias, deleteHistoria } from '../../../services/api';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { BadgeEstado } from './components/BadgeEstado';
import { IconEdit, IconDelete } from './components/Icons';
import ModalAlert from '../../../components/ModalAlert';

const styles = {
    page: { minHeight: '100vh', background: 'var(--bg)' },
    container: { maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    heading: { fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' },
    subheading: { marginTop: 4, color: 'var(--text-muted)', fontSize: '0.88rem' },
    btnNew: {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'var(--accent)', color: '#fff', border: 'none',
        borderRadius: 8, padding: '10px 18px', fontWeight: 600,
        fontSize: '0.9rem', cursor: 'pointer', transition: 'background-color 0.15s',
    },
    tableWrap: {
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' },
    th: { padding: '12px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' },
    thRight: { padding: '12px 20px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' },
    tr: { borderBottom: '1px solid var(--border)', transition: 'background-color 0.12s' },
    td: { padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 },
    tdRight: { padding: '16px 20px', textAlign: 'right' },
    actions: { display: 'inline-flex', alignItems: 'center', gap: 8 },
    btnEdit: {
        width: 34, height: 34, border: '1px solid var(--border)', borderRadius: 7,
        background: 'var(--surface)', color: 'var(--accent)', cursor: 'pointer',
        display: 'grid', placeItems: 'center', transition: 'background-color 0.12s, border-color 0.12s',
    },
    btnDelete: {
        width: 34, height: 34, border: '1px solid var(--border)', borderRadius: 7,
        background: 'var(--surface)', color: 'var(--red)', cursor: 'pointer',
        display: 'grid', placeItems: 'center', transition: 'background-color 0.12s, border-color 0.12s',
    },
    empty: { textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' },
    emptyText: { fontSize: '0.9rem', marginBottom: 16 },
};

export default function DashboardCreador() {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [historias, setHistorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const res = await readHistorias();
            setHistorias(res.data.filter((h) => h.id_creador === usuario?.id));
        } catch {
            toast.error('Error al cargar historias');
        } finally {
            setCargando(false);
        }
    };

    const handleEliminar = (id) => setConfirmDelete(id);

    const ejecutarEliminar = async () => {
        const id = confirmDelete;
        setConfirmDelete(null);
        const tid = toast.loading('Eliminando...');
        try {
            await deleteHistoria(id);
            toast.success('Historia eliminada', { id: tid });
            cargar();
        } catch {
            toast.error('Error al eliminar', { id: tid });
        }
    };

    const renderContent = () => {
        if (cargando) {
            return (
                <div style={styles.empty}>
                    <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                </div>
            );
        }
        if (historias.length === 0) {
            return (
                <div style={styles.empty}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                    </div>
                    <p style={styles.emptyText}>Aún no tienes historias. Crea tu primera novela visual.</p>
                    <button style={{ ...styles.btnNew, margin: '0 auto' }} onClick={() => navigate('/creador/nueva')}>
                        Crear historia
                    </button>
                </div>
            );
        }
        return (
            <table style={styles.table}>
                <thead style={styles.thead}>
                    <tr>
                        <th style={styles.th}>Título</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.thRight}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {historias.map((h) => (
                        <tr
                            key={h.id}
                            style={styles.tr}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <td style={styles.td}>{h.titulo}</td>
                            <td style={{ ...styles.td, fontWeight: 400 }}>
                                <BadgeEstado publicada={h.publicada} />
                            </td>
                            <td style={styles.tdRight}>
                                <div style={styles.actions}>
                                    <button
                                        title="Editar" style={styles.btnEdit}
                                        onClick={() => navigate(`/creador/historia/${h.id}`)}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                    >
                                        <IconEdit />
                                    </button>
                                    <button
                                        title="Eliminar" style={styles.btnDelete}
                                        onClick={() => handleEliminar(h.id)}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                    >
                                        <IconDelete />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div style={styles.page}>
            <Toaster position="top-right" />
            <Navbar />

            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.heading}>Mis Proyectos</h2>
                        <p style={styles.subheading}>Gestiona y crea tus novelas visuales</p>
                    </div>
                    <button
                        style={styles.btnNew}
                        onClick={() => navigate('/creador/nueva')}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        Nuevo Proyecto
                    </button>
                </div>

                <div style={styles.tableWrap}>
                    {renderContent()}
                </div>
            </div>

            <ModalAlert
                open={!!confirmDelete}
                type="warning"
                title="¿Eliminar historia?"
                message="Se eliminarán todos sus nodos y recursos asociados. Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onClose={(ok) => { if (ok) ejecutarEliminar(); else setConfirmDelete(null); }}
            />

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
