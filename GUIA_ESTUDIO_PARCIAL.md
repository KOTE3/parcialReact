# 🎓 GUÍA DE ESTUDIO - PARCIAL REACT + JWT + CRUD GAMES

> Esta guía te explica **paso a paso** cómo implementar login con JWT y CRUD de Games en React.

---

## 📋 TABLA DE CONTENIDOS

1. [Conceptos Clave](#conceptos-clave)
2. [Arquitectura General](#arquitectura-general)
3. [LOGIN CON JWT](#login-con-jwt)
4. [CRUD DE GAMES](#crud-de-games)

---

## 🎯 CONCEPTOS CLAVE

### ¿Qué es JWT?
JWT = **JSON Web Token**. Es un token que el backend genera para autenticar usuarios.

**Flujo:**
```
Usuario digita username/password → Backend genera JWT → JWT se guarda en localStorage
Cada petición incluye JWT en header → Backend valida JWT → Acceso permitido ✅
```

### ¿Qué es CRUD?
CRUD = **Create, Read, Update, Delete**
- **CREATE (C)**: POST - crear recurso nuevo
- **READ (R)**: GET - obtener recurso(s)
- **UPDATE (U)**: PUT - modificar recurso existente
- **DELETE (D)**: DELETE - eliminar recurso

---

## 🏗️ ARQUITECTURA GENERAL

```
FRONTEND (React)                    BACKEND (Spring Boot)
├── pages/
│   ├── Login/                      ← Usuario inicia sesión aquí
│   │   └── services/login.service.js
│   │
│   └── Dashboard/                  ← CRUD de Games aquí
│       └── services/games.service.js
│
├── context/
│   └── AuthContext.jsx             ← Contexto global con token
│
├── lib/axios/
│   └── axiosClient.js              ← HTTP con interceptador de token
│
└── components/
    └── ProtectedRoute.jsx          ← Protege rutas
```

**Flujo cuando abres la app:**
1. App carga → verifica si hay token en localStorage
2. Si hay token → permite acceso a `/dashboard`
3. Si NO hay token → redirecciona a `/auth/login`
4. Usuario inicia sesión → backend envía JWT
5. Frontend guarda JWT → actualiza contexto → permite acceso

---

# 🔐 LOGIN CON JWT

## Backend (ya implementado)
✅ Endpoint: `POST /rest/public/auth/login`
✅ Recibe: `{ username, password }`
✅ Devuelve: `{ accessToken: "jwt_muy_largo" }`

## Frontend - Paso a Paso

### PASO 1: AuthContext (Contexto Global)

**Archivo: `src/context/AuthContext.jsx`**

Este archivo ya existe y está bien. Entiende cada línea:

```jsx
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
```

**¿POR QUÉ?**
- `createContext()` → Crea contenedor global
- `useState(() => {...})` → Función se ejecuta solo 1 vez (al cargar)
- `localStorage.getItem()` → Recupera token guardado (persiste si recarga)
- `AuthContext.Provider` → Distribuye token a componentes que lo necesitan

---

### PASO 2: Axios con Interceptador

**Archivo: `src/lib/axios/axiosClient.js`**

Ya existe. Entiende cada parte:

```javascript
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
```

**¿POR QUÉ?**
- `axios.create()` → Instancia personalizada en vez de `axios` directo
- `baseURL` → No repetir URL en cada petición
- `interceptors.request.use()` → Hook que se ejecuta ANTES de cada petición
- `Bearer {token}` → Estándar que el backend espera

**Lo importante:** Este interceptador hace que automáticamente **TODAS** las peticiones incluyan el token.

---

### PASO 3: Servicio de Login

**Archivo: `src/pages/Login/services/login.service.js`**

Ya existe. Entiende qué hace:

```javascript
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
```

**¿POR QUÉ?**
- `async/await` → Esperar respuesta del servidor
- `try/catch` → Capturar errores (usuario no existe, contraseña incorrecta)
- Estar en un archivo separado → Separar lógica de UI

---

### PASO 4: Componente Login

**Archivo: `src/pages/Login/Login.jsx`**

Ya existe. Entiende el flujo:

```jsx
import {
    Box, Button, Container, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { useContext, useRef } from 'react';
import { login } from './services/login.service';
import { useNavigate } from 'react-router';
import AuthContext from '../../context/AuthContext';

function SignIn() {
    // 1️⃣ Ref para acceder a valores del formulario
    const ref = useRef();
    
    // 2️⃣ Hook para navegar a otras rutas
    const nav = useNavigate();
    
    // 3️⃣ Obtener setToken del contexto (para actualizar globalmente)
    const context = useContext(AuthContext);

    // Cuando usuario da click en "Login"
    const onSubmit = async (e) => {
        e.preventDefault();  // Evitar recarga de página
        
        // Obtener datos del formulario
        const formData = new FormData(ref.current);
        const data = Object.fromEntries(formData);  // {username: "...", password: "..."}
        
        console.log(data);
        
        try {
            // 1️⃣ Enviar username/password al backend
            const response = await login(data.username, data.password);
            
            // 2️⃣ Guardar token en localStorage (persiste si recarga página)
            localStorage.setItem('token', response.accessToken);
            
            // 3️⃣ Actualizar contexto (notificar a toda la app)
            context.setToken(response.accessToken);
            
            // 4️⃣ Redirigir al dashboard
            nav('/dashboard');
        } catch (error) {
            alert('Username o password incorrecto');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack spacing={3} component="form" ref={ref} onSubmit={onSubmit}>
                        <Typography variant="h4">Login</Typography>

                        <TextField
                            label="Username"
                            name="username"
                            fullWidth
                            required
                        />

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            fullWidth
                            required
                        />

                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth
                        >
                            Login
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

export default SignIn;
```

**¿POR QUÉ cada paso?**
```
1. login() → Envía credenciales, backend valida y devuelve JWT
2. localStorage.setItem() → Guardar token para que persista
3. context.setToken() → Notificar a toda la app que hay usuario autenticado
4. nav('/dashboard') → Redirigir a área privada
```

---

### PASO 5: Ruta Protegida

**Archivo: `src/components/ProtectedRoute.jsx`**

Ya existe. Es la que controla acceso:

```jsx
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
```

**¿POR QUÉ?**
- `Outlet` → Renderiza componentes hijos
- `useEffect` → Se ejecuta cuando `isAuthenticated` cambia
- Si no hay token → redirecciona a login automáticamente
- Si hay token → permite acceso

---

# 📚 CRUD DE GAMES

Ahora haremos **CRUD COMPLETO** de Games. Backend ya tiene todos endpoints listos.

## Endpoints disponibles:

| Método | Ruta | Qué hace | Requiere Auth |
|--------|------|----------|---|
| **GET** | `/rest/games` | Obtiene todos los games | ✅ SÍ |
| **GET** | `/rest/games/{id}` | Obtiene 1 game | ✅ SÍ |
| **POST** | `/rest/games` | **Crea** game nuevo | ✅ SÍ |
| **PUT** | `/rest/games/{id}` | **Actualiza** game | ✅ SÍ |
| **DELETE** | `/rest/games/{id}` | **Elimina** game | ✅ SÍ |

---

## PASO 1: Crear Servicio de Games

**Archivo: `src/pages/Dashboard/services/games.service.js`**

Ya existe. Entiéndelo:

```javascript
import axiosClient from "../../../lib/axios/axiosClient";

// ===== READ (Obtener) =====

export async function getAllGames() {
    try {
        // GET /rest/games
        // El interceptador automáticamente agrega: Authorization: Bearer {token}
        const response = await axiosClient.get('/games');
        
        // Backend devuelve: [ {id, name, description, ...}, ... ]
        console.log('Games fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching games:', error);
        throw error;
    }
}

// ===== CREATE (Crear) =====

export async function createGame(gameData) {
    try {
        // POST /rest/games
        // Enviamos: { name, description, minPlayers, maxPlayers, category, userId }
        // Backend devuelve: { id, name, description, ... } (el game creado con ID)
        const response = await axiosClient.post('/games', gameData);
        console.log('Game created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating game:', error);
        throw error;
    }
}

// ===== UPDATE (Actualizar) =====

export async function updateGame(id, gameData) {
    try {
        // PUT /rest/games/{id}
        // Enviamos: { name, description, minPlayers, maxPlayers, category, userId }
        // Backend devuelve: { id, name, description, ... } (el game actualizado)
        const response = await axiosClient.put(`/games/${id}`, gameData);
        console.log('Game updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating game:', error);
        throw error;
    }
}

// ===== DELETE (Eliminar) =====

export async function deleteGame(id) {
    try {
        // DELETE /rest/games/{id}
        // Backend devuelve 204 (vacío, pero es éxito)
        const response = await axiosClient.delete(`/games/${id}`);
        console.log('Game deleted successfully');
        return response.data;
    } catch (error) {
        console.error('Error deleting game:', error);
        throw error;
    }
}
```

**¿POR QUÉ cada función?**
- `getAllGames()` → Obtener lista de games (READ)
- `createGame(data)` → Crear game nuevo (CREATE)
- `updateGame(id, data)` → Actualizar game existente (UPDATE)
- `deleteGame(id)` → Eliminar game (DELETE)

**Nota:** El interceptador de axios automáticamente agrega el token en cada petición.

---

## PASO 2: Componente Dashboard con CRUD

Vamos a reemplazar el Dashboard actual para que tenga CRUD completo.

**Archivo: `src/pages/Dashboard/Dashboard.jsx`**

```jsx
import { Box, Typography, Button, TextField, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useEffect, useState } from "react";
import { 
    getAllGames, 
    createGame, 
    updateGame, 
    deleteGame 
} from "./services/games.service";

export default function Dashboard() {
    // ===== ESTADOS =====
    
    // Lista de games que se muestran
    const [games, setGames] = useState([]);
    
    // Controlar si está abierto el modal de crear/editar
    const [openDialog, setOpenDialog] = useState(false);
    
    // Game que se está editando (null = crear nuevo)
    const [editingGame, setEditingGame] = useState(null);
    
    // Datos que digita el usuario en el formulario
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        minPlayers: 1,
        maxPlayers: 4,
        category: '',
        userId: 1  // TODO: obtener del token decodificado
    });

    // ===== CARGAR GAMES AL MONTAR COMPONENTE =====
    
    useEffect(() => {
        loadGames();
    }, []);  // [] = ejecutar solo 1 vez

    // ===== FUNCIONES CRUD =====

    // READ: Obtener todos los games
    const loadGames = async () => {
        try {
            const data = await getAllGames();
            setGames(data);  // Actualizar lista en pantalla
        } catch (error) {
            alert('Error al cargar games: ' + error.message);
        }
    };

    // CREATE O UPDATE
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            if (editingGame) {
                // UPDATE: estamos editando un game existente
                const updated = await updateGame(editingGame.id, formData);
                
                // Actualizar lista reemplazando el game editado
                setGames(games.map(g => g.id === updated.id ? updated : g));
                alert('✅ Game actualizado');
            } else {
                // CREATE: es un game nuevo
                const created = await createGame(formData);
                
                // Agregar nuevo game a la lista
                setGames([...games, created]);
                alert('✅ Game creado');
            }
            
            // Cerrar formulario y resetear
            setOpenDialog(false);
            setEditingGame(null);
            resetForm();
        } catch (error) {
            alert('❌ Error: ' + error.message);
        }
    };

    // DELETE: Eliminar game
    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este game?')) {
            try {
                await deleteGame(id);
                
                // Remover game de la lista
                setGames(games.filter(g => g.id !== id));
                alert('✅ Game eliminado');
            } catch (error) {
                alert('❌ Error: ' + error.message);
            }
        }
    };

    // Abrir formulario para EDITAR
    const handleEdit = (game) => {
        setEditingGame(game);
        setFormData({
            name: game.name,
            description: game.description,
            minPlayers: game.minPlayers,
            maxPlayers: game.maxPlayers,
            category: game.category,
            userId: game.userId
        });
        setOpenDialog(true);
    };

    // Abrir formulario para CREAR
    const handleNew = () => {
        setEditingGame(null);
        resetForm();
        setOpenDialog(true);
    };

    // Resetear formulario a valores vacíos
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            minPlayers: 1,
            maxPlayers: 4,
            category: '',
            userId: 1
        });
    };

    // Cambio en inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'minPlayers' || name === 'maxPlayers' || name === 'userId' 
                ? parseInt(value) 
                : value
        }));
    };

    // ===== RENDER =====

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                🎮 Gestión de Games
            </Typography>

            {/* BOTÓN CREAR */}
            <Button 
                variant="contained" 
                color="success" 
                onClick={handleNew}
                sx={{ mb: 3 }}
            >
                + Crear Game
            </Button>

            {/* MODAL CREAR/EDITAR */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingGame ? 'Editar Game' : 'Crear Game'}
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2} component="form">
                        <TextField
                            label="Nombre del Game"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        
                        <TextField
                            label="Descripción"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Mín. Jugadores"
                                name="minPlayers"
                                type="number"
                                value={formData.minPlayers}
                                onChange={handleChange}
                            />
                            
                            <TextField
                                label="Máx. Jugadores"
                                name="maxPlayers"
                                type="number"
                                value={formData.maxPlayers}
                                onChange={handleChange}
                            />
                        </Box>
                        
                        <TextField
                            label="Categoría"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        variant="contained"
                    >
                        {editingGame ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* LISTA DE GAMES */}
            <Stack spacing={2}>
                {games.length === 0 ? (
                    <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
                        No hay games aún. ¡Crea uno!
                    </Typography>
                ) : (
                    games.map(game => (
                        <Paper key={game.id} sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box flex={1}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {game.name}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="textSecondary" sx={{ my: 1 }}>
                                        {game.description}
                                    </Typography>
                                    
                                    <Typography variant="caption" color="textSecondary">
                                        👥 Jugadores: {game.minPlayers}-{game.maxPlayers} | 
                                        🏷️ {game.category}
                                    </Typography>
                                </Box>
                                
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleEdit(game)}
                                    >
                                        ✏️ Editar
                                    </Button>
                                    
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDelete(game.id)}
                                    >
                                        🗑️ Eliminar
                                    </Button>
                                </Stack>
                            </Box>
                        </Paper>
                    ))
                )}
            </Stack>
        </Box>
    );
}
```

---

## ¿POR QUÉ cada parte del Dashboard?

### Estados

```javascript
const [games, setGames] = useState([]);
```
- Guardar lista de games para mostrar en pantalla

```javascript
const [openDialog, setOpenDialog] = useState(false);
```
- Controlar si el modal de crear/editar está abierto

```javascript
const [editingGame, setEditingGame] = useState(null);
```
- Saber qué game se está editando (null = crear nuevo)

```javascript
const [formData, setFormData] = useState({...});
```
- Guardar datos que digita el usuario

### useEffect

```javascript
useEffect(() => {
    loadGames();
}, []);
```
- Cargar games cuando el componente monta (primera vez)
- `[]` = ejecutar solo 1 vez

### Funciones CRUD

**loadGames()**
```javascript
const loadGames = async () => {
    const data = await getAllGames();  // GET
    setGames(data);                     // Actualizar lista
};
```

**handleSave()**
```javascript
if (editingGame) {
    // UPDATE: Actualizar game existente
    const updated = await updateGame(editingGame.id, formData);
    setGames(games.map(g => g.id === updated.id ? updated : g));
} else {
    // CREATE: Crear game nuevo
    const created = await createGame(formData);
    setGames([...games, created]);  // Agregar a lista
}
```

**handleDelete()**
```javascript
await deleteGame(id);
setGames(games.filter(g => g.id !== id));  // Quitar de lista
```

**handleEdit()**
```javascript
// Cargar datos del game en el formulario para editar
setEditingGame(game);
setFormData(game);
setOpenDialog(true);
```

**handleNew()**
```javascript
// Limpiar formulario para crear uno nuevo
setEditingGame(null);
resetForm();
setOpenDialog(true);
```

---

## ¿Cómo fluye el CRUD?

### CREATE (Crear)
```
1. Usuario da click en "+ Crear Game"
   ↓
2. handleNew() → abre modal con formulario vacío
   ↓
3. Usuario digita datos (name, description, etc.)
   ↓
4. handleChange() → actualiza formData
   ↓
5. Usuario da click en "Crear"
   ↓
6. handleSave() → POST /rest/games { formData }
   ↓
7. Backend valida y crea → devuelve game con ID
   ↓
8. setGames([...games, created]) → agregar a lista
   ↓
9. Modal cierra → lista actualizada en pantalla ✅
```

### READ (Obtener)
```
1. Componente monta → useEffect(() => loadGames())
   ↓
2. loadGames() → GET /rest/games
   ↓
3. Backend devuelve lista
   ↓
4. setGames(data) → actualizar lista
   ↓
5. Pantalla renderiza lista ✅
```

### UPDATE (Actualizar)
```
1. Usuario da click en "Editar" en un game
   ↓
2. handleEdit(game) → abre modal con datos del game
   ↓
3. Usuario modifica campos
   ↓
4. handleChange() → actualiza formData
   ↓
5. Usuario da click en "Actualizar"
   ↓
6. handleSave() → PUT /rest/games/{id} { formData }
   ↓
7. Backend valida y actualiza → devuelve game actualizado
   ↓
8. setGames(games.map(...)) → reemplazar en lista
   ↓
9. Modal cierra → lista actualizada en pantalla ✅
```

### DELETE (Eliminar)
```
1. Usuario da click en "Eliminar" en un game
   ↓
2. Confirmación: ¿Estás seguro?
   ↓
3. handleDelete(id) → DELETE /rest/games/{id}
   ↓
4. Backend elimina de BD
   ↓
5. setGames(games.filter(...)) → quitar de lista
   ↓
6. Lista actualizada en pantalla ✅
```

---

## ¿Cómo actualizar la lista después de cada operación?

### CREATE: Agregar al array
```javascript
// Nuevo game se crea con ID
const created = await createGame(formData);

// Agregar al final de la lista
setGames([...games, created]);
```

### UPDATE: Reemplazar en array
```javascript
// Game actualizado viene del backend
const updated = await updateGame(editingGame.id, formData);

// Reemplazar solo ese game en la lista
setGames(games.map(g => 
    g.id === updated.id ? updated : g
));
```

### DELETE: Quitar del array
```javascript
// Eliminar del backend
await deleteGame(id);

// Quitar de la lista (mantener los demás)
setGames(games.filter(g => g.id !== id));
```

---

# 🔑 RESUMEN: Conceptos Clave

## 1. Interceptador automático
```javascript
// axiosClient.interceptors.request.use()
// Automáticamente agrega: Authorization: Bearer {token}
// En TODAS las peticiones
```

## 2. Flujo de autenticación
```
Login (credentials) → JWT → localStorage → Context → ProtectedRoute ✅
```

## 3. Flujo de CRUD
```
Servicio (axios) → Backend → Actualizar lista → Render UI ✅
```

## 4. Estados = UI
```javascript
const [games, setGames] = useState([]);
// Si games cambia → componente re-renderiza automáticamente
```

---

# ✅ CHECKLIST: ¿Entiendo todo?

- [ ] Sé qué es JWT y por qué se necesita
- [ ] Entiendo el flujo: login → guardar token → incluir en peticiones
- [ ] Sé cómo funciona el interceptador de axios
- [ ] Sé cómo hacer GET, POST, PUT, DELETE
- [ ] Entiendo useState y useEffect
- [ ] Sé cómo actualizar una lista después de CREATE/UPDATE/DELETE
- [ ] Puedo explicar por qué cada línea de código existe
- [ ] Puedo hacer CRUD sin copiar: desde cero

---

# 🎯 PARA TU PARCIAL

Si te piden hacer CRUD de otra entidad (no Games), la receta es la misma:

```
1. Crear servicio con getAllX(), createX(), updateX(), deleteX()
2. Crear componente con:
   - useState para lista, openDialog, editing, formData
   - useEffect para cargar
   - Funciones para loadX, handleSave, handleDelete
   - UI con lista y formulario
3. Actualizar lista después de cada operación:
   - CREATE: [...items, created]
   - UPDATE: items.map(...)
   - DELETE: items.filter(...)
```

---

# 🚀 ¡ÉXITO EN EL PARCIAL! 💪
