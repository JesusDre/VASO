import { useState, useEffect } from 'react';
import { readHistorias } from '../../../../services/api';

export function useHistorias() {
    const [historias, setHistorias] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        readHistorias()
            .then((res) => setHistorias(res.data.filter((h) => h.publicada)))
            .catch(() => {})
            .finally(() => setCargando(false));
    }, []);

    const filtradas = historias.filter((h) =>
        h.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        (h.descripcion || '').toLowerCase().includes(filtro.toLowerCase())
    );

    return { filtradas, filtro, setFiltro, cargando };
}
