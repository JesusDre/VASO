import { useState, useEffect } from 'react';
import { readVisitas, registrarVisita } from '../services/api';

const SEGUNDOS = Number(import.meta.env.VITE_VISITA_SEGUNDOS) || 60;
const SESSION_KEY = 'visita_registrada';

export function useContadorVisitas() {
    const [total, setTotal] = useState(null);

    useEffect(() => {
        // Obtener el total actual al montar
        readVisitas()
            .then((res) => setTotal(res.data.total))
            .catch(() => {});

        // Si ya se registró en esta sesión, no contar de nuevo
        if (sessionStorage.getItem(SESSION_KEY)) return;

        const timer = setTimeout(() => {
            registrarVisita()
                .then((res) => {
                    setTotal(res.data.total);
                    sessionStorage.setItem(SESSION_KEY, '1');
                })
                .catch(() => {});
        }, SEGUNDOS * 1000);

        return () => clearTimeout(timer);
    }, []);

    return { total };
}
