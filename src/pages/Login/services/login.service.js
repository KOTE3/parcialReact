import axiosClient from "../../../lib/axios/axiosClient";

export async function login(username, password) {
    try {
        // Petición POST al backend
        // Ruta: /rest/public/auth/login (permitida sin autenticación)
        // Cuerpo: { username, password }
        const response = await axiosClient.post('/public/auth/login', { 
            username, 
            password 
        });
        
        console.log('Login successful:', response.data);
        
        // Backend devuelve: { accessToken: "jwt_token_muy_largo" }
        // Devolver para que Login.jsx lo maneje
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;  // Lanzar error para que Login.jsx lo maneje
    }
}