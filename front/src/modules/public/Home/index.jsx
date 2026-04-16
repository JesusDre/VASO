import Navbar from '../../../components/Navbar';
import HistoriaCard from '../../../components/HistoriaCard';
import { useHistorias } from './hooks/useHistorias';
import './Home.css';

export default function Home() {
    const { filtradas, filtro, setFiltro, categoria, setCategoria, categorias, cargando } = useHistorias();

    const sinResultados = !filtro && !categoria
        ? 'Aún no hay historias publicadas.'
        : 'No hay historias que coincidan con los filtros.';

    let resultsContent;
    if (cargando) {
        resultsContent = (
            <div className="nv-home-feedback">
                <div className="nv-spinner" />
                <p>Cargando historias...</p>
            </div>
        );
    } else if (filtradas.length === 0) {
        resultsContent = (
            <div className="nv-home-feedback">
                <p>{sinResultados}</p>
            </div>
        );
    } else {
        resultsContent = (
        <div className="nv-stories-grid">
            {filtradas.map((h) => (
                <HistoriaCard key={h.id} historia={h} />
            ))}
        </div>
    );

    return (
        <div className="nv-home-page">
            <Navbar />

            <div className="nv-home-header">
                <div className="nv-home-header-inner">
                    <div className="nv-home-heading">
                        <h1>Explorar Historias</h1>
                        <p>Sumérgete en aventuras interactivas creadas por la comunidad.</p>
                    </div>
                    <div className="nv-search-wrap">
                        <input
                            type="text"
                            placeholder="Buscar novela..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                </div>

                {categorias.length > 0 && (
                    <div className="nv-home-header-inner" style={{ paddingTop: 0 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setCategoria('')}
                                className={`nv-cat-btn${categoria === '' ? ' active' : ''}`}
                            >
                                Todas
                            </button>
                            {categorias.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setCategoria(String(c.id))}
                                    className={`nv-cat-btn${String(categoria) === String(c.id) ? ' active' : ''}`}
                                >
                                    {c.nombre}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="nv-home-results">
                {resultsContent}
            </div>
        </div>
    );
}
