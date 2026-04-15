import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readHistoria, readProgresos, deleteProgreso } from '../../../services/api';
import Navbar from '../../../components/Navbar';
import ModalAlert from '../../../components/ModalAlert';
import { useAuth } from '../../../context/AuthContext';
import './DetalleHistoria.css';

export default function DetalleHistoria() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const decodedId = useMemo(() => {
        try {
            return Number(atob(id));
        } catch {
            return Number(id);
        }
    }, [id]);

    const [historia, setHistoria] = useState(null);
    const [autor, setAutor] = useState('');
    const [progreso, setProgreso] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [modalReiniciar, setModalReiniciar] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            try {
                const resHistoria = await readHistoria(decodedId);
                const hist = resHistoria.data;
                setHistoria(hist);

                if (hist.nombre_creador) setAutor(hist.nombre_creador);

                if (usuario) {
                    const resProgresos = await readProgresos();
                    const progresoExistente = resProgresos.data.find(
                        (p) => Number(p.id_historia) === decodedId
                    );
                    setProgreso(progresoExistente || null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [id, usuario]);

    const handleComenzar = () => navigate(`/leer/${btoa(String(decodedId))}`);

    const handleReiniciar = () => setModalReiniciar(true);

    const confirmarReiniciar = async (confirmed) => {
        setModalReiniciar(false);
        if (!confirmed) return;
        if (progreso) {
            try { await deleteProgreso(progreso.id); } catch { /* continuar igual */ }
        }
        navigate(`/leer/${btoa(String(decodedId))}`);
    };

    if (cargando) {
        return (
            <div className="dh-page">
                <Navbar />
                <div className="dh-spinner-wrap">
                    <div className="dh-spinner" />
                </div>
            </div>
        );
    }

    if (!historia) {
        return (
            <div className="dh-page">
                <Navbar />
                <div className="dh-not-found">
                    <p>Historia no encontrada.</p>
                    <button onClick={() => navigate('/')}>Volver al catálogo</button>
                </div>
            </div>
        );
    }

    const portadaSrc = historia.portada_base64
        ? `data:image/png;base64,${historia.portada_base64}`
        : historia.portada_url || null;

    return (
        <div className="dh-page">
            <Navbar />
            <ModalAlert
                open={modalReiniciar}
                onClose={confirmarReiniciar}
                type="warning"
                title="Reiniciar historia"
                message="Se perderá tu progreso actual. ¿Deseas comenzar desde el principio?"
                confirmText="Reiniciar"
                cancelText="Cancelar"
            />

            <div className="dh-back-bar">
                <button className="dh-back-btn" onClick={() => navigate('/')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver al catálogo
                </button>
            </div>

            <div className="dh-hero-wrap">
                <div
                    className="dh-hero-card"
                    style={portadaSrc ? { backgroundImage: `url(${portadaSrc})` } : {}}
                >
                    {portadaSrc && <div className="dh-hero-overlay" />}

                    <div className={`dh-hero-content ${portadaSrc ? 'has-image' : 'no-image'}`}>
                        <div className="dh-badge">{historia.nombre_categoria ? `${historia.nombre_categoria} • Novela Visual` : 'Novela Visual'}</div>

                        <h1 className="dh-title">{historia.titulo}</h1>

                        {autor && (
                            <p className="dh-author">por {autor}</p>
                        )}

                        <div className="dh-divider" />

                        {historia.descripcion && (
                            <p className="dh-description">
                                "{historia.descripcion}"
                            </p>
                        )}

                        <div className="dh-actions">
                            <button className="dh-btn-comenzar" onClick={handleComenzar}>
                                {progreso ? 'Continuar Aventura' : 'Comenzar Aventura'}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            </button>
                            {progreso && (
                                <button className="dh-btn-reiniciar" onClick={handleReiniciar}>
                                    Reiniciar
                                </button>
                            )}
                        </div>

                        {!usuario && (
                            <p className="dh-login-hint">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline', font: 'inherit' }}
                                >Inicia sesión</button> para guardar tu progreso.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
