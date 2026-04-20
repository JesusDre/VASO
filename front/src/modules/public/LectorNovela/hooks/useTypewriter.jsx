import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';

export function useTypewriter(texto, velocidad = 28) {
    const [displayado, setDisplayado] = useState('');
    const [listo, setListo] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!texto) { setDisplayado(''); setListo(true); return; }
        setDisplayado('');
        setListo(false);
        let i = 0;
        intervalRef.current = setInterval(() => {
            i++;
            setDisplayado(texto.slice(0, i));
            if (i >= texto.length) {
                clearInterval(intervalRef.current);
                setListo(true);
            }
        }, velocidad);
        return () => clearInterval(intervalRef.current);
    }, [texto]);

    const terminar = useCallback(() => {
        clearInterval(intervalRef.current);
        setDisplayado(texto);
        setListo(true);
    }, [texto]);

    return { displayado, listo, terminar };
}
