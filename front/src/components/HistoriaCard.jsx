import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../styles/historia-card.css';

function IconImage() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}

function IconEye() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export default function HistoriaCard({ historia }) {
    const navigate = useNavigate();

    const src = historia.portada_base64
        ? `data:image/png;base64,${historia.portada_base64}`
        : historia.portada_url || null;

    const openHistoria = () => navigate(`/historia/${btoa(String(historia.id))}`);

    const fecha = new Date(historia.fecha_creacion).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'short'
    });

    return (
        <button
            type="button"
            className="nv-story-card"
            onClick={openHistoria}
        >
            <div
                className="nv-story-cover"
                style={src ? { backgroundImage: `url(${src})` } : undefined}
                aria-hidden="true"
            >
                {!src && (
                    <div className="nv-story-cover-placeholder">
                        <IconImage />
                    </div>
                )}
                <span className="nv-story-category">{historia.nombre_categoria || 'Novela Visual'}</span>
            </div>

            <div className="nv-story-body">
                <h3 className="nv-story-title">{historia.titulo}</h3>
                <p className="nv-story-description">
                    {historia.descripcion || 'Sin descripción disponible.'}
                </p>
                <div className="nv-story-footer">
                    <span className="nv-story-views">
                        <IconEye />
                        {fecha}
                    </span>
                    <span
                        className="nv-story-btn"
                        aria-hidden="true"
                    >
                        Leer ahora
                    </span>
                </div>
            </div>
        </button>
    );
}

HistoriaCard.propTypes = {
    historia: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        titulo: PropTypes.string.isRequired,
        descripcion: PropTypes.string,
        portada_base64: PropTypes.string,
        portada_url: PropTypes.string,
        fecha_creacion: PropTypes.string,
        nombre_categoria: PropTypes.string,
    }).isRequired,
};
