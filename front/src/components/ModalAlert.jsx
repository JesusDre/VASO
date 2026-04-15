import { useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/modal-alert.css';

const icons = {
    success: (
        <svg className="modal-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    ),
    error: (
        <svg className="modal-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    warning: (
        <svg className="modal-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    info: (
        <svg className="modal-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
};

export default function ModalAlert({
    open,
    onClose,
    title,
    message,
    type = 'info',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    hideCancel = false,
}) {
    const handleCancel = () => onClose(false);
    const handleConfirm = () => onClose(true);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => { if (e.key === 'Escape') handleCancel(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="modal-alert-backdrop"
            onClick={handleCancel}
            onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
            role="presentation"
        >
            <dialog
                open
                className={`modal-alert-box alert-${type}`}
                onClick={(e) => e.stopPropagation()}
                aria-labelledby="modal-alert-title"
                aria-describedby="modal-alert-description"
            >
                <div className="modal-alert-body">
                    {icons[type] ?? icons.info}
                    <h2 id="modal-alert-title" className="modal-alert-title">{title}</h2>
                    <p id="modal-alert-description" className="modal-alert-message">{message}</p>
                </div>

                <div className="modal-alert-actions">
                    {!hideCancel && (
                        <button className="modal-alert-btn modal-alert-btn-cancel" onClick={handleCancel}>
                            {cancelText}
                        </button>
                    )}
                    <button className="modal-alert-btn modal-alert-btn-confirm" onClick={handleConfirm}>
                        {confirmText}
                    </button>
                </div>
            </dialog>
        </div>
    );
}

ModalAlert.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    hideCancel: PropTypes.bool,
};
