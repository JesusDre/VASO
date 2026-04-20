import React from 'react';
import Navbar from '../../../components/Navbar';
import TabRecursos from '../EditorHistoria/components/TabRecursos';
import { Toaster } from 'react-hot-toast';

export default function Biblioteca() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Toaster position="top-right" />
            <Navbar />

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>
                        Biblioteca de Recursos
                    </h2>
                    <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Gestiona todas tus imágenes y audios disponibles para tus historias
                    </p>
                </div>

                <TabRecursos />
            </div>
        </div>
    );
}
