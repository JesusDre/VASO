import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readHistoria } from '../../../services/api';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { btnPrimary } from './styles/editorStyles';
import TabInfo from './components/TabInfo';
import TabRecursos from './components/TabRecursos';
import TabPersonajes from './components/TabPersonajes';
import TabNodos from './components/TabNodos';
import TabOpciones from './components/TabOpciones';

export default function EditorHistoria() {
    const { id } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [historia, setHistoria] = useState(null);
    const [historiaId, setHistoriaId] = useState(id || null);
    const [tab, setTab] = useState('info');
    const [cargando, setCargando] = useState(!!id);

    useEffect(() => {
        if (id) {
            readHistoria(id)
                .then((r) => setHistoria(r.data))
                .catch(() => toast.error('Historia no encontrada'))
                .finally(() => setCargando(false));
        }
    }, [id]);

    const onHistoriaCreada = (nuevoId) => {
        setHistoriaId(nuevoId);
        navigate(`/creador/historia/${nuevoId}`, { replace: true });
    };

    const tabs = [
        { key: 'info',       label: 'Configurar Introducción' },
        { key: 'recursos',   label: 'Recursos',        disabled: !historiaId },
        { key: 'personajes', label: 'Personajes',      disabled: !historiaId },
        { key: 'nodos',      label: 'Nodos / Escenas', disabled: !historiaId },
        { key: 'opciones',   label: 'Opciones',        disabled: !historiaId },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Toaster position="top-right" />
            <Navbar />

            {/* Header */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => navigate('/creador')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: '0.9rem', padding: 0 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                            {historiaId ? `Diseñando: ${historia?.titulo || '...'}` : 'Nueva Historia'}
                        </div>
                        {historiaId && (
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginTop: 1 }}>
                                {tab === 'nodos' && 'Editor de escenas'}
                                {tab === 'info' && 'Configuración general'}
                                {tab === 'recursos' && 'Gestión de recursos'}
                                {tab === 'personajes' && 'Personajes'}
                                {tab === 'opciones' && 'Opciones de decisión'}
                            </div>
                        )}
                    </div>

                    {historiaId && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', height: 34, padding: '0 14px',
                                borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-2)',
                                fontSize: '0.84rem', fontWeight: 600,
                                color: historia?.publicada ? 'var(--green)' : 'var(--yellow)',
                            }}>
                                {historia?.publicada ? 'Publicado' : 'Borrador'}
                            </span>
                            <button
                                onClick={() => setTab('info')}
                                style={{ ...btnPrimary, height: 34, padding: '0 16px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                Guardar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: 0, overflowX: 'auto' }}>
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            disabled={t.disabled}
                            onClick={() => setTab(t.key)}
                            style={{
                                background: 'none',
                                border: 'none',
                                borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '14px 18px',
                                cursor: t.disabled ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                                color: tab === t.key ? 'var(--accent)' : t.disabled ? '#c0cfe0' : 'var(--text-muted)',
                                fontWeight: tab === t.key ? 700 : 500,
                                fontSize: '0.88rem',
                                transition: 'color 0.15s',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
                {cargando ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                    </div>
                ) : (
                    <>
                        {tab === 'info'       && <TabInfo historia={historia} historiaId={historiaId} usuario={usuario} onGuardado={onHistoriaCreada} />}
                        {tab === 'recursos'   && historiaId && <TabRecursos />}
                        {tab === 'personajes' && historiaId && <TabPersonajes historiaId={historiaId} />}
                        {tab === 'nodos'      && historiaId && <TabNodos historiaId={historiaId} />}
                        {tab === 'opciones'   && historiaId && <TabOpciones historiaId={historiaId} />}
                    </>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
