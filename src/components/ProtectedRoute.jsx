import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import AuthContext from "../context/AuthContext";

export default function ProtectedRoute() {
    // Obtener token del contexto
    const { isAuthenticated } = useContext(AuthContext);
    const nav = useNavigate();

    // Efecto: cuando isAuthenticated cambia, verificar
    useEffect(() => {
        // Si NO hay token, redirigir a login
        if (!isAuthenticated) {
            nav("/auth/login");
        }
    }, [isAuthenticated, nav]);

    // Si hay token, renderizar componentes hijos (Dashboard, Profile, etc.)
    // Outlet = componentes que están dentro de esta ruta
    return <Outlet />;
}