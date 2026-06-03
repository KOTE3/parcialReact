import { createContext, useState } from "react";

// Crear contexto = "caja global" para autenticación
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Estado: guardar token (null = no autenticado)
    const [token, setToken] = useState(() => {
        // Inicialización: buscar token en localStorage
        const storedToken = localStorage.getItem("token");
        
        // Si no existe token guardado, devolver null
        if (!storedToken) {
            return null;
        }
        
        // Si existe, usarlo (permite que la app persista sesión si recarga)
        return storedToken;
    });
    
    // Distribuir token a todos los componentes hijos
    return (
        <AuthContext.Provider value={{ isAuthenticated: token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;