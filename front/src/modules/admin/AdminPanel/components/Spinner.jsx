export default function Spinner() {
    return (
        <div style={{
            width: 28, height: 28, margin: '0 auto',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
        }} />
    );
}
