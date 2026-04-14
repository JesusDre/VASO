import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';
import Navbar from '../../components/Navbar';
import '../../styles/login.css';

const initialState = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    confirmar_password: '',
};

function validarPassword(password) {
    const errores = [];
    if (password.length < 8) errores.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) errores.push('al menos una mayúscula');
    if (!/[0-9]/.test(password)) errores.push('al menos un número');
    if (!/[^a-zA-Z0-9]/.test(password)) errores.push('al menos un carácter especial');
    return errores;
}

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const erroresPassword = validarPassword(formData.password);
        if (erroresPassword.length > 0) {
            setError(`La contraseña debe tener: ${erroresPassword.join(', ')}.`);
            return;
        }
        if (formData.password !== formData.confirmar_password) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        const { confirmar_password, ...payload } = formData;
        try {
            await registerUser(payload);
            setSuccess('¡Registro completado! Redirigiendo...');
            setFormData(initialState);
            setTimeout(() => navigate('/login'), 900);
        } catch (apiError) {
            const responseData = apiError.response?.data;
            if (responseData && typeof responseData === 'object') {
                const readableErrors = Object.values(responseData).flat().join(' ');
                setError(readableErrors || 'No fue posible completar el registro.');
            } else {
                setError('No fue posible completar el registro.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <Navbar />

            <div className="login-body">
                <div className="login-card" style={{ maxWidth: 500 }}>
                    {/* Logo */}
                    <div className="login-logo">C</div>

                    <h1 className="login-title">Crear cuenta</h1>
                    <p className="login-subtitle">Únete a la comunidad creativa</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Nombre + Apellido paterno */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="login-field">
                                <label htmlFor="nombre" className="login-label">
                                    Nombre <span className="login-required">*</span>
                                </label>
                                <div className="login-input-wrap">
                                    <span className="login-input-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        autoComplete="given-name"
                                        required
                                        placeholder="Tu nombre"
                                    />
                                </div>
                            </div>

                            <div className="login-field">
                                <label htmlFor="apellido_paterno" className="login-label">
                                    Apellido paterno <span className="login-required">*</span>
                                </label>
                                <div className="login-input-wrap">
                                    <span className="login-input-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="apellido_paterno"
                                        name="apellido_paterno"
                                        type="text"
                                        value={formData.apellido_paterno}
                                        onChange={handleChange}
                                        autoComplete="family-name"
                                        required
                                        placeholder="Apellido paterno"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Apellido materno */}
                        <div className="login-field">
                            <label htmlFor="apellido_materno" className="login-label">
                                Apellido materno
                            </label>
                            <div className="login-input-wrap">
                                <span className="login-input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input
                                    id="apellido_materno"
                                    name="apellido_materno"
                                    type="text"
                                    value={formData.apellido_materno}
                                    onChange={handleChange}
                                    placeholder="Apellido materno (opcional)"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="login-field">
                            <label htmlFor="email" className="login-label">
                                Correo electrónico <span className="login-required">*</span>
                            </label>
                            <div className="login-input-wrap">
                                <span className="login-input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    required
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className="login-field">
                            <label htmlFor="password" className="login-label">
                                Contraseña <span className="login-required">*</span>
                            </label>
                            <div className="login-input-wrap">
                                <span className="login-input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="login-hint">
                                Mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
                            </p>
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="login-field">
                            <label htmlFor="confirmar_password" className="login-label">
                                Confirmar contraseña <span className="login-required">*</span>
                            </label>
                            <div className="login-input-wrap">
                                <span className="login-input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="confirmar_password"
                                    name="confirmar_password"
                                    type="password"
                                    value={formData.confirmar_password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="login-error" role="alert">{error}</div>
                        )}
                        {success && (
                            <div className="login-success" role="status">{success}</div>
                        )}

                        <button type="submit" disabled={loading} className="login-btn">
                            {loading ? 'Creando cuenta...' : 'Registrarme'}
                        </button>
                    </form>

                    <p className="login-footer">
                        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
