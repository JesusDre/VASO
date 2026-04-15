import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { readHistorias, readCategorias } from '../../../../services/api';

export function useHistorias() {
    const [historias, setHistorias]     = useState([]);
    const [categorias, setCategorias]   = useState([]);
    const [filtro, setFiltro]           = useState('');
    const [categoria, setCategoria]     = useState('');
    const [cargando, setCargando]       = useState(true);
    const [error, setError]             = useState(false);

    useEffect(() => {
        readHistorias()
            .then((res) => setHistorias(res.data.filter((h) => h.publicada)))
            .catch(() => { setError(true); toast.error('No se pudieron cargar las historias'); })
            .finally(() => setCargando(false));

        readCategorias()
            .then((res) => setCategorias(res.data))
            .catch(() => {});
    }, []);

    const filtradas = historias.filter((h) => {
        const coincideTexto =
            h.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
            (h.descripcion || '').toLowerCase().includes(filtro.toLowerCase());

        const coincideCategoria = categoria === '' || String(h.categoria) === String(categoria);

        return coincideTexto && coincideCategoria;
    });

    return { filtradas, filtro, setFiltro, categoria, setCategoria, categorias, cargando, error };
}
