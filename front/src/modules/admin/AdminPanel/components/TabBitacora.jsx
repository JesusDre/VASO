import { useState, useEffect, useCallback } from 'react';
import { readBitacora } from '../../../../services/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import Empty from './Empty';

const TIPOS = ['', 'CREAR', 'EDITAR', 'ELIMINAR'];
const MODELOS = ['', 'Historia', 'Categoria', 'MiUsuario', 'Nodo'];

const BADGE_COLOR = {
    CREAR:    { bg: 'var(--green-bg)',   color: 'var(--green)' },
    EDITAR:   { bg: '#eff6ff',           color: '#2563eb'      },
    ELIMINAR: { bg: 'var(--red-bg)',     color: 'var(--red)'   },
};

export default function TabBitacora() {
    const [registros, setRegistros]       = useState([]);
    const [cargando, setCargando]         = useState(true);
    const [expandido, setExpandido]       = useState(null);
    const [filtros, setFiltros]           = useState({
        nombre_dato:     '',
        tipo_movimiento: '',
        fecha_desde:     '',
        fecha_hasta:     '',
    });

    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            const params = {};
            if (filtros.nombre_dato)     params.nombre_dato     = filtros.nombre_dato;
            if (filtros.tipo_movimiento) params.tipo_movimiento = filtros.tipo_movimiento;
            if (filtros.fecha_desde)     params.fecha_desde     = filtros.fecha_desde;
            if (filtros.fecha_hasta)     params.fecha_hasta     = filtros.fecha_hasta;
            const res = await readBitacora(params);
            setRegistros(res.data);
        } catch {
            toast.error('Error al cargar la bitácora');
        } finally {
            setCargando(false);
        }
    }, [filtros]);

    useEffect(() => { cargar(); }, [cargar]);

    const handleFiltro = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    const limpiarFiltros = () => {
        setFiltros({ nombre_dato: '', tipo_movimiento: '', fecha_desde: '', fecha_hasta: '' });
    };

    const selectStyle = {
        height: 34, padding: '0 10px', borderRadius: 7,
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--text)', fontSize: '0.83rem', cursor: 'pointer',
    };

    const inputStyle = {
        height: 34, padding: '0 10px', borderRadius: 7,
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--text)', fontSize: '0.83rem',
    };

    const bitacoraContenido = cargando
        ? <div style={{ textAlign: 'center', padding: '3rem 0' }}><Spinner /></div>
        : registros.length === 0
            ? <Empty texto="Sin registros en la bitácora." />
            : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {registros.map((r) => {
                        const badge = BADGE_COLOR[r.tipo_movimiento] || {};
                        const isOpen = expandido === r.id;
                        const fecha = new Date(r.fecha_hora).toLocaleString('es-MX', {
                            year: 'numeric', month: 'short', day: '2-digit',
                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                        });

                        return (
                            <div key={r.id} style={{
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
                            }}>
                                {/* Fila principal */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setExpandido(isOpen ? null : r.id)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandido(isOpen ? null : r.id); }}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center',
                                        gap: 12, flexWrap: 'wrap',
                                    }}
                                >
                                    {/* Badge tipo */}
                                    <span style={{
                                        height: 22, padding: '0 10px', borderRadius: 20,
                                        fontSize: '0.72rem', fontWeight: 700,
                                        display: 'inline-flex', alignItems: 'center',
                                        background: badge.bg, color: badge.color,
                                        flexShrink: 0,
                                    }}>
                                        {r.tipo_movimiento}
                                    </span>

                                    {/* Nombre del dato */}
                                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', flexShrink: 0 }}>
                                        {r.nombre_dato}
                                    </span>

                                    <span style={{ color: 'var(--border)', flexShrink: 0 }}>·</span>

                                    {/* Fecha */}
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                                        {fecha}
                                    </span>

                                    <span style={{ color: 'var(--border)', flexShrink: 0 }}>·</span>

                                    {/* Usuario */}
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                                        {r.usuario_email || 'Anónimo'}
                                    </span>

                                    <span style={{ color: 'var(--border)', flexShrink: 0 }}>·</span>

                                    {/* IP */}
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace', flexShrink: 0 }}>
                                        {r.host_origen || '—'}
                                    </span>

                                    {/* Indicador expandir */}
                                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.78rem', flexShrink: 0 }}>
                                        {isOpen ? '▲ Ocultar' : '▼ Ver valores'}
                                    </span>
                                </div>

                                {/* Detalle expandido */}
                                {isOpen && (
                                    <div style={{
                                        borderTop: '1px solid var(--border)',
                                        padding: '14px 16px',
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 14,
                                    }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                                                Valor anterior
                                            </p>
                                            <pre style={{
                                                fontSize: '0.76rem', color: 'var(--text)',
                                                background: 'var(--surface-2)', borderRadius: 6,
                                                padding: '10px 12px', overflowX: 'auto',
                                                margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                            }}>
                                                {r.valor_anterior ? JSON.stringify(r.valor_anterior, null, 2) : '—'}
                                            </pre>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                                                Valor nuevo
                                            </p>
                                            <pre style={{
                                                fontSize: '0.76rem', color: 'var(--text)',
                                                background: 'var(--surface-2)', borderRadius: 6,
                                                padding: '10px 12px', overflowX: 'auto',
                                                margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                            }}>
                                                {r.valor_nuevo ? JSON.stringify(r.valor_nuevo, null, 2) : '—'}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );

    return (
        <div>
            {/* Filtros */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'flex-end' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Tabla</div>
                    <select name="nombre_dato" value={filtros.nombre_dato} onChange={handleFiltro} style={selectStyle}>
                        {MODELOS.map((m) => <option key={m} value={m}>{m || 'Todas'}</option>)}
                    </select>
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Movimiento</div>
                    <select name="tipo_movimiento" value={filtros.tipo_movimiento} onChange={handleFiltro} style={selectStyle}>
                        {TIPOS.map((t) => <option key={t} value={t}>{t || 'Todos'}</option>)}
                    </select>
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Desde</div>
                    <input type="date" name="fecha_desde" value={filtros.fecha_desde} onChange={handleFiltro} style={inputStyle} />
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Hasta</div>
                    <input type="date" name="fecha_hasta" value={filtros.fecha_hasta} onChange={handleFiltro} style={inputStyle} />
                </div>
                <button onClick={limpiarFiltros} style={{
                    height: 34, padding: '0 14px', borderRadius: 7,
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    color: 'var(--text-muted)', fontSize: '0.83rem', cursor: 'pointer',
                }}>
                    Limpiar
                </button>
            </div>

            {/* Conteo */}
            {!cargando && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    {registros.length} registro{registros.length === 1 ? '' : 's'} encontrado{registros.length === 1 ? '' : 's'}
                </p>
            )}

            {/* Tabla */}
            {bitacoraContenido}
        </div>
    );
}
