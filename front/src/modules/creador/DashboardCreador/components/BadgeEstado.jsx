export function BadgeEstado({ publicada }) {
    return (
        <span style={{
            display: 'inline-block',
            borderRadius: 6,
            padding: '3px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: publicada ? 'var(--green-bg)' : 'var(--yellow-bg)',
            color: publicada ? 'var(--green)' : 'var(--yellow)',
        }}>
            {publicada ? 'Publicado' : 'Borrador'}
        </span>
    );
}
