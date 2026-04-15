import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    readHistoria, readNodos, readOpciones,
    readNodoPersonajes, readPersonajes, readImagenes, readAudios,
    readProgresos, createProgreso, updateProgreso,
} from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';
import { useTypewriter } from './hooks/useTypewriter';
import { IconVolume } from './components/IconVolume';
import './LectorNovela.css';

const resolverImagen = (img) => {
    if (!img) return null;
    if (img.imagen_base64_display) return `data:image/png;base64,${img.imagen_base64_display}`;
    if (img.url) return img.url.startsWith('http') ? img.url : `http://localhost:8000${img.url}`;
    return null;
};

export default function LectorNovela() {
    const { historiaId } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const decodedHistoriaId = useMemo(() => {
        try {
            return Number(atob(historiaId));
        } catch {
            return Number(historiaId);
        }
    }, [historiaId]);

    const [nodosMap, setNodosMap] = useState({});
    const [opcionesMap, setOpcionesMap] = useState({});
    const [npMap, setNpMap] = useState({});
    const [personajesMap, setPersonajesMap] = useState({});
    const [imagenesMap, setImagenesMap] = useState({});
    const [audiosMap, setAudiosMap] = useState({});
    const [progresoId, setProgresoId] = useState(null);

    const [nodoActual, setNodoActual] = useState(null);
    const [cargandoInicial, setCargandoInicial] = useState(true);
    const [error, setError] = useState('');
    const [muted, setMuted] = useState(false);

    const audioRef = useRef(null);
    const { displayado, listo, terminar } = useTypewriter(nodoActual?.texto || '');

    useEffect(() => {
        if (!decodedHistoriaId) return;
        const cargar = async () => {
            try {
                const [
                    resHistoria, resNodos, resOpciones,
                    resNP, resPersonajes, resImagenes,
                    resAudios, resProgresos,
                ] = await Promise.all([
                    readHistoria(decodedHistoriaId),
                    readNodos(),
                    readOpciones(),
                    readNodoPersonajes(),
                    readPersonajes(),
                    readImagenes(),
                    readAudios(),
                    usuario ? readProgresos() : Promise.resolve({ data: [] }),
                ]);

                const hist = resHistoria.data;

                const nodosFiltrados = resNodos.data.filter(
                    (n) => Number(n.id_historia) === decodedHistoriaId
                );
                const nm = {};
                nodosFiltrados.forEach((n) => { nm[n.id] = n; });
                setNodosMap(nm);

                const om = {};
                resOpciones.data.forEach((o) => {
                    if (!om[o.id_nodo_origen]) om[o.id_nodo_origen] = [];
                    om[o.id_nodo_origen].push(o);
                });
                setOpcionesMap(om);

                const npm = {};
                resNP.data.forEach((np) => {
                    if (!npm[np.id_nodo]) npm[np.id_nodo] = [];
                    npm[np.id_nodo].push(np);
                });
                setNpMap(npm);

                const pm = {};
                resPersonajes.data.forEach((p) => { pm[p.id] = p; });
                setPersonajesMap(pm);

                const im = {};
                resImagenes.data.forEach((i) => { im[i.id] = i; });
                setImagenesMap(im);

                const am = {};
                resAudios.data.forEach((a) => { am[a.id] = a; });
                setAudiosMap(am);

                let nodoInicial;
                const progresoExistente = usuario
                    ? resProgresos.data.find((p) => Number(p.id_historia) === decodedHistoriaId)
                    : null;

                if (progresoExistente) {
                    setProgresoId(progresoExistente.id);
                    nodoInicial = nm[progresoExistente.id_nodo_actual];
                }
                if (!nodoInicial) nodoInicial = nm[hist.id_nodo_inicio];
                if (!nodoInicial) nodoInicial = nodosFiltrados[0];

                setNodoActual(nodoInicial || null);
            } catch (err) {
                console.error(err);
                setError('Error al cargar la historia.');
            } finally {
                setCargandoInicial(false);
            }
        };
        cargar();
    }, [decodedHistoriaId]);

    useEffect(() => {
        if (!nodoActual) return;
        const audio = audiosMap[nodoActual.id_audio_fondo];
        let url = null;
        if (audio?.archivo) {
            url = audio.archivo.startsWith('http') ? audio.archivo : `http://localhost:8000${audio.archivo}`;
        }

        audioRef.current?.pause();
        if (url) {
            audioRef.current = new Audio(url);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.4;
            audioRef.current.muted = muted;
            audioRef.current.play().catch(() => {});
        } else {
            audioRef.current = null;
        }
        return () => { audioRef.current?.pause(); };
    }, [nodoActual?.id]);

    const guardarProgreso = async (nodoId) => {
        if (!usuario) return;
        try {
            if (progresoId) {
                await updateProgreso(progresoId, { id_historia: decodedHistoriaId, id_nodo_actual: nodoId });
            } else {
                const res = await createProgreso({ id_historia: decodedHistoriaId, id_nodo_actual: nodoId });
                setProgresoId(res.data.id);
            }
        } catch (err) {
            console.error('Error al guardar progreso:', err);
        }
    };

    const irANodo = (nodoId) => {
        const nodo = nodosMap[nodoId];
        if (!nodo) return;
        setNodoActual(nodo);
        guardarProgreso(nodoId);
    };

    const handleTextClick = () => { if (!listo) terminar(); };

    const toggleMute = () => {
        const nuevoMuted = !muted;
        setMuted(nuevoMuted);
        if (audioRef.current) audioRef.current.muted = nuevoMuted;
    };

    const opciones = nodoActual ? (opcionesMap[nodoActual.id] || []) : [];
    const personajesEnNodo = nodoActual ? (npMap[nodoActual.id] || []) : [];
    const imagenFondo = nodoActual?.id_imagen_escenario ? imagenesMap[nodoActual.id_imagen_escenario] : null;
    const fondoSrc = resolverImagen(imagenFondo);

    const personajesPorPos = { izquierda: null, centro: null, derecha: null };
    personajesEnNodo.forEach((np) => {
        const p = personajesMap[np.id_personaje];
        if (!p) return;
        const img = imagenesMap[p.id_imagen];
        personajesPorPos[np.posicion] = { ...p, imagenUrl: resolverImagen(img) };
    });

    if (cargandoInicial) {
        return (
            <div className="ln-page">
                <Navbar />
                <div className="ln-state-wrap">
                    <div className="ln-spinner" />
                    <p>Cargando historia...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ln-page">
                <Navbar />
                <div className="ln-state-wrap">
                    <p className="ln-state-error">{error}</p>
                    <button className="ln-state-btn" onClick={() => navigate('/')}>Volver</button>
                </div>
            </div>
        );
    }

    if (!nodoActual) {
        return (
            <div className="ln-page">
                <Navbar />
                <div className="ln-state-wrap">
                    <p>Esta historia no tiene nodos configurados.</p>
                    <button className="ln-state-btn" onClick={() => navigate('/')}>Volver al inicio</button>
                </div>
            </div>
        );
    }

    const personajeHablando =
        personajesPorPos.centro?.nombre ||
        personajesPorPos.izquierda?.nombre ||
        personajesPorPos.derecha?.nombre ||
        null;

    return (
        <div className="ln-page">
            <Navbar />

            <div className="ln-topbar">
                <button className="ln-back-btn" onClick={() => navigate(`/historia/${btoa(String(decodedHistoriaId))}`)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Salir
                </button>
                <span className="ln-scene-label">{nodoActual.titulo_nodo}</span>
            </div>

            <div className="ln-game-wrap">
                <div className="ln-stage" style={fondoSrc ? { backgroundImage: `url(${fondoSrc})` } : {}}>
                    <div className="ln-stage-overlay" />

                    {!fondoSrc && (
                        <div className="ln-stage-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                        </div>
                    )}

                    <div className="ln-characters">
                        {['izquierda', 'centro', 'derecha'].map((pos) => {
                            const p = personajesPorPos[pos];
                            if (!p?.imagenUrl) return null;
                            return (
                                <img key={pos} src={p.imagenUrl} alt={p.nombre} className={`ln-character ln-character-${pos}`} />
                            );
                        })}
                    </div>

                    <button className="ln-mute-btn" onClick={toggleMute} title={muted ? 'Activar audio' : 'Silenciar'}>
                        <IconVolume muted={muted} />
                    </button>

                    <div
                        className="ln-text-panel"
                        role="button"
                        tabIndex={0}
                        onClick={handleTextClick}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTextClick(); }}
                    >
                        {personajeHablando && <div className="ln-character-name">{personajeHablando}</div>}

                        <div className="ln-panel-body">
                            <p className="ln-narrative" style={{ cursor: listo ? 'default' : 'pointer' }}>
                                "{displayado}"
                                {!listo && <span className="ln-cursor">|</span>}
                            </p>

                            {listo && opciones.length > 0 && (
                                <div className="ln-options">
                                    {opciones.map((op, idx) => (
                                        <button key={op.id} className="ln-option-btn" onClick={() => irANodo(op.id_nodo_destino)}>
                                            {String.fromCodePoint(65 + idx)}. {op.texto_opcion}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {listo && nodoActual.es_final && opciones.length === 0 && (
                                <div className="ln-final">
                                    <span className="ln-final-label">— FIN —</span>
                                    <button className="ln-final-btn" onClick={() => navigate('/')}>Volver al catálogo</button>
                                </div>
                            )}

                            {listo && !nodoActual.es_final && opciones.length === 0 && (
                                <p className="ln-no-continue">Sin continuación configurada.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
