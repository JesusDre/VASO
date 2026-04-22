export const PATTERNS = {
    SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/,
    SOLO_NUMEROS: /^\d*$/,
    ALFANUMERICO: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]*$/,
    EMAIL: /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/,
    TEXTO_SEGURO: /^[^<>;"\\`]*$/,
};

const SQL_INJECTION_PATTERNS = [
    /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE|ALTER|CREATE|TRUNCATE|DECLARE)(\b)/i,
    /(--|\/\*|\*\/|;--|';|";)/,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
    /(\bOR\b|\bAND\b)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"]/i,
    /xp_|sp_/i,
];

export function contieneSQLInjection(value) {
    if (!value || typeof value !== 'string') return false;
    return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

export function sanitize(value, tipo) {
    if (value === '' || value === null || value === undefined) return value;

    const pattern = PATTERNS[tipo];
    if (pattern && !pattern.test(value)) {
        return null;
    }

    if (contieneSQLInjection(value)) {
        return null;
    }

    return value;
}

export function escaparHTML(texto) {
    if (!texto) return texto;
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function validarAntesDeEnviar(formData, campos) {
    const errores = [];
    for (const [campo, tipo] of Object.entries(campos)) {
        const valor = formData[campo];
        if (!valor) continue;
        if (contieneSQLInjection(valor)) {
            errores.push(`Caracteres no permitidos en ${campo}.`);
            continue;
        }
        const pattern = PATTERNS[tipo];
        if (pattern && !pattern.test(valor)) {
            errores.push(`Formato inválido en ${campo}.`);
        }
    }
    return errores;
}
