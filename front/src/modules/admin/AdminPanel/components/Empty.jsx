import PropTypes from 'prop-types';

export default function Empty({ texto }) {
    return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {texto}
        </div>
    );
}

Empty.propTypes = {
    texto: PropTypes.string.isRequired,
};
