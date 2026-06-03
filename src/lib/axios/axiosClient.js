import axios from "axios";

// URL base del backend desde variables de entorno
const baseURL = import.meta.env.VITE_API_URL;

// Crear instancia de axios
const axiosClient = axios.create({
    baseURL,  // URL base
    headers: {
        'Content-Type': 'application/json',  // Decir que enviamos JSON
    },
});

// ⭐ INTERCEPTADOR: se ejecuta ANTES de cada petición
// Objetivo: agregar token automáticamente en el header
axiosClient.interceptors.request.use(config => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    // Si existe token, agregarlo al header
    if (token) {
        // Formato: "Bearer {token}" (estándar OAuth2)
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Devolver config actualizado
    return config;
});

export default axiosClient;