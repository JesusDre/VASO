// Servicio central de API — Novelas Visuales
import axios from 'axios';

const BASE = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE });

// -----------------------------------------------------------
// Interceptor de Solicitud: agrega el token JWT
// -----------------------------------------------------------
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// -----------------------------------------------------------
// Interceptor de Respuesta: renueva token si expira (401)
// -----------------------------------------------------------
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refresh = localStorage.getItem('refresh_token');
            // Sin refresh token no habia sesion activa — no redirigir
            if (!refresh) return Promise.reject(error);
            try {
                const res = await axios.post(`${BASE}/api/token/refresh/`, { refresh });
                localStorage.setItem('access_token', res.data.access);
                if (res.data.refresh) localStorage.setItem('refresh_token', res.data.refresh);
                original.headers['Authorization'] = `Bearer ${res.data.access}`;
                return api(original);
            } catch {
                // La sesion expiro completamente — limpiar y redirigir
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('usuario');
                localStorage.removeItem('rol');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// -----------------------------------------------------------
// AUTENTICACION
// -----------------------------------------------------------
export const loginUser      = (data) => api.post('/api/login/', data);
export const registerUser   = (data) => api.post('/api/registro/', data);

// -----------------------------------------------------------
// HISTORIAS
// -----------------------------------------------------------
export const readHistorias  = ()         => api.get('/api/historias/');
export const readHistoria   = (id)       => api.get(`/api/historias/${id}/`);
export const createHistoria = (data)     => api.post('/api/historias/', data);
export const updateHistoria = (id, data) => api.put(`/api/historias/${id}/`, data);
export const deleteHistoria = (id)       => api.delete(`/api/historias/${id}/`);

// -----------------------------------------------------------
// NODOS
// -----------------------------------------------------------
export const readNodos  = ()         => api.get('/api/nodos/');
export const readNodo   = (id)       => api.get(`/api/nodos/${id}/`);
export const createNodo = (data)     => api.post('/api/nodos/', data);
export const updateNodo = (id, data) => api.put(`/api/nodos/${id}/`, data);
export const deleteNodo = (id)       => api.delete(`/api/nodos/${id}/`);

// -----------------------------------------------------------
// OPCIONES
// -----------------------------------------------------------
export const readOpciones  = ()         => api.get('/api/opciones/');
export const createOpcion  = (data)     => api.post('/api/opciones/', data);
export const updateOpcion  = (id, data) => api.put(`/api/opciones/${id}/`, data);
export const deleteOpcion  = (id)       => api.delete(`/api/opciones/${id}/`);

// -----------------------------------------------------------
// PERSONAJES
// -----------------------------------------------------------
export const readPersonajes  = ()         => api.get('/api/personajes/');
export const createPersonaje = (data)     => api.post('/api/personajes/', data);
export const updatePersonaje = (id, data) => api.put(`/api/personajes/${id}/`, data);
export const deletePersonaje = (id)       => api.delete(`/api/personajes/${id}/`);

// -----------------------------------------------------------
// NODO-PERSONAJE
// -----------------------------------------------------------
export const readNodoPersonajes    = ()         => api.get('/api/nodo-personajes/');
export const createNodoPersonaje   = (data)     => api.post('/api/nodo-personajes/', data);
export const updateNodoPersonaje   = (id, data) => api.put(`/api/nodo-personajes/${id}/`, data);
export const deleteNodoPersonaje   = (id)       => api.delete(`/api/nodo-personajes/${id}/`);

// -----------------------------------------------------------
// IMAGENES
// -----------------------------------------------------------
export const readImagenes  = ()         => api.get('/api/imagenes/');
export const createImagen  = (data)     => api.post('/api/imagenes/', data);
export const updateImagen  = (id, data) => api.put(`/api/imagenes/${id}/`, data);
export const deleteImagen  = (id)       => api.delete(`/api/imagenes/${id}/`);

// -----------------------------------------------------------
// AUDIOS
// -----------------------------------------------------------
export const readAudios  = ()         => api.get('/api/audios/');
export const createAudio = (data)     => api.post('/api/audios/', data);
export const updateAudio = (id, data) => api.put(`/api/audios/${id}/`, data);
export const deleteAudio = (id)       => api.delete(`/api/audios/${id}/`);

// -----------------------------------------------------------
// PROGRESOS
// -----------------------------------------------------------
export const readProgresos  = ()         => api.get('/api/progresos/');
export const createProgreso = (data)     => api.post('/api/progresos/', data);
export const updateProgreso = (id, data) => api.put(`/api/progresos/${id}/`, data);
export const deleteProgreso = (id)       => api.delete(`/api/progresos/${id}/`);

// -----------------------------------------------------------
// USUARIOS
// -----------------------------------------------------------
export const readUsuarios  = ()         => api.get('/api/usuarios/');
export const deleteUsuario = (id)       => api.delete(`/api/usuarios/${id}/`);

// -----------------------------------------------------------
// ROLES
// -----------------------------------------------------------
export const readRoles  = ()         => api.get('/api/roles/');
export const createRol  = (data)     => api.post('/api/roles/', data);
export const updateRol  = (id, data) => api.put(`/api/roles/${id}/`, data);
export const deleteRol  = (id)       => api.delete(`/api/roles/${id}/`);

// -----------------------------------------------------------
// CATEGORIAS
// -----------------------------------------------------------
export const readCategorias  = ()         => api.get('/api/categorias/');
export const createCategoria = (data)     => api.post('/api/categorias/', data);
export const updateCategoria = (id, data) => api.put(`/api/categorias/${id}/`, data);

// -----------------------------------------------------------
// VISITAS
// -----------------------------------------------------------
export const readVisitas     = ()  => api.get('/api/visitas/');
export const registrarVisita = ()  => api.post('/api/visitas/');

// -----------------------------------------------------------
// BITACORA DE AUDITORIA (solo lectura, solo admin)
// -----------------------------------------------------------
export const readBitacora = (params = {}) => api.get('/api/bitacora/', { params });
