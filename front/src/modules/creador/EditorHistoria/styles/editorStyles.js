export const inputStyle = {
    width: '100%',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 12px',
    color: 'var(--text)',
    fontSize: '0.9rem',
};

export const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    marginBottom: 6,
};

export const selectStyle = {
    ...inputStyle,
    height: 42,
    cursor: 'pointer',
};

export const btnPrimary = {
    background: 'var(--accent)',
    border: 'none',
    color: 'white',
    padding: '9px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
};

export const btnGhost = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.9rem',
};

export const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 20,
    boxShadow: 'var(--shadow-sm)',
};
