import { useState, useEffect } from 'react';
import { readHistorias, updateHistoria } from '../../../../services/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import Empty from './Empty';

export default function TabHistorias() {
    const [historias, setHistorias] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [cargando, setCargando] = useState(true);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const rh = await readHistorias();
            setHistorias(rh.data);
        } catch { toast.error('Error al cargar historias'); }
        finally { setCargando(false); }
    };

    const togglePublicar = async (h) => {
        const tid = toast.loading(h.publicada ? 'Despublicando...' : 'Publicando...');
        try {
            await updateHistoria(h.id, { ...h, publicada: !h.publicada });
            toast.success(h.publicada ? 'Historia despublicada' : 'Historia publicada', { id: tid });
            cargar();
        } catch { toast.error('Error al cambiar estado', { id: tid }); }
    };

    const FILTROS = [
        { key: 'todos', label: 'Todos' },
        { key: 'publicadas', label: 'Publicadas' },
        { key: 'borradores', label: 'Borradores' },
    ];

    const filtradas = historias.filter((h) => {
        if (filtro === 'publicadas') return h.publicada;
        if (filtro === 'borradores') return !h.publicada;
        return true;
    });

    const historiasContenido = filtradas.length === 0 ? (
        <Empty texto="Sin historias en esta categoría." />
    ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtradas.map((h) => (
                <div key={h.id} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                            <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.93rem' }}>
                                {h.titulo}
                            </span>
                            <span className={`nv-badge ${h.publicada ? 'nv-badge-green' : 'nv-badge-yellow'}`}>
                                {h.publicada ? 'Publicada' : 'Borrador'}
                            </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {h.nombre_creador && <span>Autor: {h.nombre_creador}</span>}
                            <span>·</span>
                            <span>ID {h.id}</span>
                            <span>·</span>
                            <span>{new Date(h.fecha_creacion).toLocaleDateString('es-MX')}</span>
                        </div>
                        {h.descripcion && (
                            <p style={{
                                color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4,
                                overflow: 'hidden', display: '-webkit-box',
                                WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                            }}>
                                {h.descripcion}
                            </p>
                        )}
                    </div>
                    <button onClick={() => togglePublicar(h)} style={{
                        height: 32, padding: '0 14px', borderRadius: 7,
                        border: `1px solid ${h.publicada ? 'var(--red)' : 'var(--green)'}`,
                        background: h.publicada ? 'var(--red-bg)' : 'var(--green-bg)',
                        color: h.publicada ? 'var(--red)' : 'var(--green)',
                        fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        whiteSpace: 'nowrap', transition: 'opacity 0.15s',
                    }}>
                        {h.publicada ? 'Despublicar' : 'Publicar'}
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {FILTROS.map(({ key, label }) => (
                    <button key={key} onClick={() => setFiltro(key)} style={{
                        height: 32, padding: '0 16px', borderRadius: 20,
                        border: `1px solid ${filtro === key ? 'var(--accent)' : 'var(--border)'}`,
                        background: filtro === key ? 'var(--accent-light)' : 'var(--surface)',
                        color: filtro === key ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: filtro === key ? 700 : 500,
                        fontSize: '0.83rem', cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                        {label} {filtro === key && `(${filtradas.length})`}
                    </button>
                ))}
            </div>

            {cargando ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}><Spinner /></div>
            ) : historiasContenido}
        </div>
    );
}
