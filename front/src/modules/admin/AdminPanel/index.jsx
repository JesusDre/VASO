
import { useState } from 'react';
import Navbar from '../../../components/Navbar';
import { Toaster } from 'react-hot-toast';
import TabHistorias from './components/TabHistorias';
import TabUsuarios from './components/TabUsuarios';
import TabRoles from './components/TabRoles';
import TabCategorias from './components/TabCategorias';
import TabBitacora from './components/TabBitacora';

export default function AdminPanel() {
    const [tab, setTab] = useState('historias');

    const tabs = [
        { key: 'historias',  label: 'Historias' },
        { key: 'usuarios',   label: 'Usuarios' },
        { key: 'roles',      label: 'Roles' },
        { key: 'categorias', label: 'Categorías' },
        { key: 'bitacora',   label: 'Bitácora' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Toaster position="top-right" />
            <Navbar />

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>
                        Panel de Administración
                    </h2>
                    <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Gestiona historias, usuarios y roles del sistema
                    </p>
                </div>

                <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 28, display: 'flex', gap: 4 }}>
                    {tabs.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            background: 'none', border: 'none',
                            borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                            padding: '10px 20px', marginBottom: -1, cursor: 'pointer',
                            color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)',
                            fontWeight: tab === t.key ? 700 : 500,
                            fontSize: '0.92rem', transition: 'color 0.15s',
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'historias'  && <TabHistorias />}
                {tab === 'usuarios'   && <TabUsuarios />}
                {tab === 'roles'      && <TabRoles />}
                {tab === 'categorias' && <TabCategorias />}
                {tab === 'bitacora'   && <TabBitacora />}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
