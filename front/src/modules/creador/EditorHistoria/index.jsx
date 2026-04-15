import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { readHistoria } from '../../../services/api';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import TabInfo from './components/TabInfo';
import TabRecursos from './components/TabRecursos';
import TabPersonajes from './components/TabPersonajes';
import TabNodos from './components/TabNodos';
import TabOpciones from './components/TabOpciones';

const NEXT_STEP = {
    info: {
        nextTab: 'recursos',
        label: 'Ir a Recursos',
        titulo: 'Siguiente: sube imágenes y audios',
        descripcion: 'Agrega los fondos, sprites de personajes y música antes de crear escenas.',
    },
    recursos: {
        nextTab: 'nodos',
        label: 'Ir a Escenas',
        titulo: 'Siguiente: crea las escenas',
        descripcion: 'Cada escena tiene texto narrativo, fondo y audio. Son la base de tu historia.',
    },
    nodos: {
        nextTab: 'personajes',
        label: 'Ir a Personajes',
        titulo: 'Siguiente: crea los personajes',
        descripcion: 'Define los personajes y asígnalos a las escenas con su posición en pantalla.',
    },
    personajes: {
        nextTab: 'opciones',
        label: 'Ir a Decisiones',
        titulo: 'Siguiente: conecta las escenas',
        descripcion: 'Añade decisiones para enlazar escenas y crear una narrativa ramificada.',
    },
};

const TABS = [
    { key: 'info',       label: 'Configuración',  numero: '1' },
    { key: 'recursos',   label: 'Recursos',        numero: '2' },
    { key: 'nodos',      label: 'Escenas',         numero: '3' },
    { key: 'personajes', label: 'Personajes',      numero: '4' },
    { key: 'opciones',   label: 'Decisiones',      numero: '5' },
];

export default function EditorHistoria() {
    const { id } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [historia, setHistoria] = useState(null);
    const [historiaId, setHistoriaId] = useState(id || null);
    const [tab, setTab] = useState(location.state?.tabInicial || 'info');
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
        navigate(`/creador/historia/${nuevoId}`, { replace: true, state: { tabInicial: 'recursos' } });
    };

    const tabActual = TABS.find((t) => t.key === tab);
    const siguientePaso = historiaId ? NEXT_STEP[tab] : null;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Toaster position="top-right" />
            <Navbar />

            {/* Header */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => navigate('/creador')}
                        title="Volver a Mis Proyectos"
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: '0.9rem', padding: 0 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Mis proyectos
                    </button>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                            {historiaId ? (historia?.titulo || '...') : 'Nueva Historia'}
                        </div>
                        {historiaId && tabActual && (
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginTop: 1 }}>
                                Paso {tabActual.numero} de 5 — {tabActual.label}
                            </div>
                        )}
                    </div>

                    {historiaId && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', height: 34, padding: '0 14px',
                            borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-2)',
                            fontSize: '0.84rem', fontWeight: 600,
                            color: historia?.publicada ? 'var(--green)' : 'var(--yellow)',
                        }}>
                            {historia?.publicada ? 'Publicado' : 'Borrador'}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: 0, overflowX: 'auto' }}>
                    {TABS.map((t) => {
                        const deshabilitado = t.key !== 'info' && !historiaId;
                        const activo = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                disabled={deshabilitado}
                                onClick={() => setTab(t.key)}
                                title={deshabilitado ? 'Guarda la configuración primero para continuar' : undefined}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activo ? '2px solid var(--accent)' : '2px solid transparent',
                                    padding: '14px 18px',
                                    cursor: deshabilitado ? 'not-allowed' : 'pointer',
                                    whiteSpace: 'nowrap',
                                    color: activo ? 'var(--accent)' : (deshabilitado ? '#c0cfe0' : 'var(--text-muted)'),
                                    fontWeight: activo ? 700 : 500,
                                    fontSize: '0.88rem',
                                    transition: 'color 0.15s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 18, height: 18, borderRadius: '50%', fontSize: '0.68rem', fontWeight: 800,
                                    background: activo ? 'var(--accent)' : (deshabilitado ? '#e2e8f0' : 'var(--surface-2)'),
                                    color: activo ? '#fff' : (deshabilitado ? '#b0bec5' : 'var(--text-muted)'),
                                    flexShrink: 0,
                                }}>
                                    {t.numero}
                                </span>
                                {t.label}
                            </button>
                        );
                    })}
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

                        {/* Siguiente paso */}
                        {siguientePaso && (
                            <div style={{
                                marginTop: 36,
                                padding: '16px 20px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
                                flexWrap: 'wrap',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'var(--accent-light, #ede9fe)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9rem' }}>
                                            {siguientePaso.titulo}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', margin: '2px 0 0', fontSize: '0.82rem' }}>
                                            {siguientePaso.descripcion}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setTab(siguientePaso.nextTab)}
                                    style={{
                                        background: 'var(--accent)', border: 'none', color: '#fff',
                                        padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
                                        fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}
                                >
                                    {siguientePaso.label}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* CTA publicar en último paso */}
                        {tab === 'opciones' && historiaId && !historia?.publicada && (
                            <div style={{
                                marginTop: 36,
                                padding: '16px 20px',
                                background: 'var(--green-bg, #f0fdf4)',
                                border: '1px solid var(--green, #16a34a)',
                                borderRadius: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
                                flexWrap: 'wrap',
                            }}>
                                <div>
                                    <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9rem' }}>
                                        ¿Lista para publicar?
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', margin: '2px 0 0', fontSize: '0.82rem' }}>
                                        Ve a Configuración para seleccionar el nodo de inicio y publicar tu historia.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setTab('info')}
                                    style={{
                                        background: 'var(--green, #16a34a)', border: 'none', color: '#fff',
                                        padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
                                        fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap',
                                    }}
                                >
                                    Ir a publicar
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
