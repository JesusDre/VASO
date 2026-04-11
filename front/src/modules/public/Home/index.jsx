import Navbar from '../../../components/Navbar';
import HistoriaCard from '../../../components/HistoriaCard';
import { useHistorias } from './hooks/useHistorias';
import './Home.css';

export default function Home() {
    const { filtradas, filtro, setFiltro, cargando } = useHistorias();

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
            </div>

            <div className="nv-home-results">
                {cargando ? (
                    <div className="nv-home-feedback">
                        <div className="nv-spinner" />
                        <p>Cargando historias...</p>
                    </div>
                ) : filtradas.length === 0 ? (
                    <div className="nv-home-feedback">
                        <p>
                            {filtro
                                ? 'No hay historias que coincidan con tu búsqueda.'
                                : 'Aún no hay historias publicadas.'}
                        </p>
                    </div>
                ) : (
                    <div className="nv-stories-grid">
                        {filtradas.map((h) => (
                            <HistoriaCard key={h.id} historia={h} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
