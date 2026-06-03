import { createBrowserRouter } from "react-router";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Register from "../pages/Register/Register";
import ProfileCard from "../components/ProfileCard";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
    {
        path: "/", // @RequestMapping("/")
        element: <ProfileCard />,
    },
    {
        path: "/dashboard",
        element: <ProtectedRoute />,
        children: [
            {
                element: <Dashboard />,
                index: true,
            },
            {
                path: "profile",
                element: <h1>Mi perfil</h1>,
            },
            {
                path: "change-account",
                element: <h1>Cambiar cuenta</h1>,
            },
        ]
    },
    {
        path: "/auth",
        children: [
            {
                element: <Login />,
                index: true,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            }
        ]
    }
], { basename: "/compu2" });

export default router;