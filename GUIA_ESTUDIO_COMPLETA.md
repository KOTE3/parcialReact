# 🎓 GUÍA DE ESTUDIO - PARCIAL REACT + JWT + CRUD GAMES

> Esta guía te explica **paso a paso** cómo implementar login con JWT y CRUD de Games en React.
> **IMPORTANTE:** También te muestra qué debes entender del backend para no cometer errores.

---

## 📋 TABLA DE CONTENIDOS

1. [Conceptos Clave](#conceptos-clave)
2. [Entender el Backend](#entender-el-backend)
3. [Router.jsx - Rutas](#routerjsx---rutas)
4. [LOGIN CON JWT](#login-con-jwt)
5. [CRUD DE GAMES](#crud-de-games)
6. [Errores Comunes](#errores-comunes)

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

## 🔌 ENTENDER EL BACKEND

**Esto es CRÍTICO** para no equivocarse en el parcial.

### ¿Qué es un Endpoint?

Un endpoint es una **URL + método HTTP** que el backend expone.

**Ejemplo:**
```
POST /rest/public/auth/login
    ↑        ↑     ↑        ↑
  MÉTODO   PREFIJO RECURSO ACCIÓN
```

### Estructura de un Endpoint

Cada endpoint tiene:
1. **Método HTTP**: GET, POST, PUT, DELETE
2. **Ruta**: `/rest/games`, `/rest/games/{id}`, etc.
3. **Qué recibe (Request)**: datos que ENVÍAS al backend
4. **Qué devuelve (Response)**: datos que RECIBES del backend
5. **Requiere autenticación**: ¿Necesita token?

### Cómo Leer Documentación de Backend

Si el backend te dice:
```
POST /rest/games
Request: { name, description, minPlayers, maxPlayers, category, userId }
Response: { id, name, description, minPlayers, maxPlayers, category, userId, username }
Auth required: YES
```

Significa:
```javascript
// 1. Es una petición POST (crear)
// 2. La ruta es "/rest/games"
// 3. Tienes que ENVIAR estos datos:
const data = {
    name: "Ajedrez",
    description: "Juego de estrategia",
    minPlayers: 2,
    maxPlayers: 2,
    category: "Estrategia",
    userId: 1
};

// 4. El backend te DEVUELVE lo mismo + el id generado
// 5. Necesita token (el interceptador lo agrega automáticamente)
```

### Los 5 Endpoints que TÚ usarás en el parcial

#### 1️⃣ LOGIN (Obtener JWT)
```
POST /rest/public/auth/login
Request: { username, password }
Response: { accessToken: "jwt_muy_largo" }
Auth: NO (es público)
```

En React:
```javascript
const response = await axiosClient.post('/public/auth/login', {
    username: "admin",
    password: "123456"
});
// response.data = { accessToken: "eyJhbGc..." }
localStorage.setItem('token', response.data.accessToken);
```

#### 2️⃣ OBTENER TODOS (READ)
```
GET /rest/games
Request: (vacío, no envías nada)
Response: [ {id, name, description, ...}, {id, name, ...}, ... ]
Auth: YES (necesita token)
```

En React:
```javascript
const response = await axiosClient.get('/games');
// response.data = [{id: 1, name: "Chess", ...}, {id: 2, name: "Monopoly", ...}]
```

#### 3️⃣ OBTENER UNO (READ)
```
GET /rest/games/{id}
Request: (vacío)
Response: {id, name, description, ...}
Auth: YES
```

En React:
```javascript
const response = await axiosClient.get('/games/5');
// response.data = {id: 5, name: "Chess", description: "...", ...}
```

#### 4️⃣ CREAR (CREATE)
```
POST /rest/games
Request: { name, description, minPlayers, maxPlayers, category, userId }
Response: {id, name, description, minPlayers, maxPlayers, category, userId, username}
Auth: YES
Status Code: 201 (CREATED)
```

En React:
```javascript
const response = await axiosClient.post('/games', {
    name: "Ajedrez",
    description: "Juego de estrategia",
    minPlayers: 2,
    maxPlayers: 2,
    category: "Estrategia",
    userId: 1
});
// response.status = 201
// response.data = {id: 10, name: "Ajedrez", ...}
```

#### 5️⃣ ACTUALIZAR (UPDATE)
```
PUT /rest/games/{id}
Request: { name, description, minPlayers, maxPlayers, category, userId }
Response: {id, name, description, ...}
Auth: YES
Status Code: 200 (OK)
```

En React:
```javascript
const response = await axiosClient.put('/games/5', {
    name: "Ajedrez Modificado",
    description: "Nueva descripción",
    minPlayers: 2,
    maxPlayers: 2,
    category: "Estrategia",
    userId: 1
});
// response.data = {id: 5, name: "Ajedrez Modificado", ...}
```

#### 6️⃣ ELIMINAR (DELETE)
```
DELETE /rest/games/{id}
Request: (vacío)
Response: (vacío - solo status 204)
Auth: YES
Status Code: 204 (NO_CONTENT)
```

En React:
```javascript
const response = await axiosClient.delete('/games/5');
// response.status = 204
// No hay respuesta con datos
```

### Status Codes HTTP - Qué significan

| Código | Significado | Qué hacer |
|--------|-------------|-----------|
| **200** | OK | Petición exitosa, datos en response |
| **201** | Created | Recurso creado exitosamente |
| **204** | No Content | Exitoso pero sin datos (DELETE) |
| **400** | Bad Request | Tu petición está mal (datos incorrectos) |
| **401** | Unauthorized | Token inválido o expirado ❌ |
| **404** | Not Found | El recurso no existe (id incorrecto) |
| **500** | Server Error | Error en el backend |

### ¿Dónde está la baseURL?

**Archivo: `.env`** (en raíz del proyecto)
```env
VITE_API_URL=http://localhost:8081/compunet2-2026/rest
```

El backend está en:
- `http://localhost:8081` (servidor, puerto 8081)
- `/compunet2-2026` (context-path)
- `/rest` (prefijo de rutas REST)

Entonces:
- `GET /games` completo es: `http://localhost:8081/compunet2-2026/rest/games`
- `POST /public/auth/login` completo es: `http://localhost:8081/compunet2-2026/rest/public/auth/login`

El axiosClient automáticamente agrega la baseURL.

---

## 🛣️ Router.jsx - Rutas

**Archivo: `src/router/Router.jsx`**

Es el archivo que controla qué componente se muestra en cada URL.

### Estructura actual

```jsx
import { createBrowserRouter } from "react-router";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Register from "../pages/Register/Register";
import ProfileCard from "../components/ProfileCard";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
    {
        path: "/",  // Ruta: http://localhost:5173/
        element: <ProfileCard />,
    },
    {
        path: "/dashboard",  // Ruta: http://localhost:5173/dashboard
        element: <ProtectedRoute />,  // ⭐ PROTEGIDA: si no hay token → redirige a login
        children: [  // Rutas dentro de dashboard
            {
                element: <Dashboard />,
                index: true,  // Ruta por defecto: /dashboard
            },
            {
                path: "profile",
                element: <h1>Mi perfil</h1>,  // /dashboard/profile
            },
            {
                path: "change-account",
                element: <h1>Cambiar cuenta</h1>,  // /dashboard/change-account
            },
        ]
    },
    {
        path: "/auth",  // Ruta: http://localhost:5173/auth
        children: [  // Subrutas de auth
            {
                element: <Login />,
                index: true,  // /auth (por defecto muestra Login)
            },
            {
                path: "login",
                element: <Login />,  // /auth/login
            },
            {
                path: "register",
                element: <Register />,  // /auth/register
            }
        ]
    }
], { basename: "/compu2" });

export default router;
```

### ¿Qué significa cada cosa?

**`path`**: La URL que ve el usuario
```javascript
path: "/dashboard"  // http://localhost:5173/dashboard
path: "/auth/login" // http://localhost:5173/auth/login
```

**`element`**: El componente que se muestra
```javascript
element: <Dashboard />  // Muestra componente Dashboard
```

**`children`**: Rutas dentro de esta ruta (subrutas)
```javascript
{
    path: "/dashboard",
    children: [
        { element: <Dashboard />, index: true },  // /dashboard
        { path: "profile", element: <Profile /> }  // /dashboard/profile
    ]
}
```

**`index: true`**: Ruta por defecto dentro de children
```javascript
index: true  // Significa que es /dashboard (sin sufijo)
```

**`ProtectedRoute`**: Ruta protegida
```javascript
element: <ProtectedRoute />  // Si no hay token, redirecciona a /auth/login
```

**`basename`**: Prefijo en todas las rutas
```javascript
{ basename: "/compu2" }  // Todas las rutas tienen /compu2 delante
// /dashboard real es: http://localhost:5173/compu2/dashboard
```

### Flujo de Navegación

```
1. Usuario abre app → va a /
   └─ Muestra <ProfileCard />

2. Usuario da click en "Login" → va a /auth/login
   └─ Muestra <Login />

3. Usuario inicia sesión → nav('/dashboard')
   └─ ProtectedRoute verifica si hay token
      ├─ Si hay token: muestra <Dashboard />
      └─ Si NO hay token: redirige a /auth/login

4. Usuario en /dashboard/profile
   └─ ProtectedRoute valida → muestra componente de Profile
```

### Cómo agregar nuevas rutas

Si en el parcial te piden agregar una nueva página:

```javascript
// 1. Importar componente
import GameDetail from "../pages/GameDetail/GameDetail";

// 2. Agregar ruta
{
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
        { element: <Dashboard />, index: true },
        { path: "games/:id", element: <GameDetail /> }  // ← Nueva ruta
        // Ahora existe: /dashboard/games/5 para ver detalles del game 5
    ]
}
```

El `:id` es un **parámetro dinámico** que puedes obtener en el componente:

```jsx
import { useParams } from "react-router";

export default function GameDetail() {
    const { id } = useParams();
    // id = "5" (como string)
    const gameId = parseInt(id);
    
    useEffect(() => {
        // Cargar detalles del game
        getGameById(gameId);
    }, [gameId]);
}
```

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

---

### PASO 2: Axios con Interceptador

**Archivo: `src/lib/axios/axiosClient.js`**

```javascript
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ⭐ INTERCEPTADOR: agrega token automáticamente
axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
});

export default axiosClient;
```

---

### PASO 3: Servicio de Login

**Archivo: `src/pages/Login/services/login.service.js`**

```javascript
import axiosClient from "../../../lib/axios/axiosClient";

export async function login(username, password) {
    try {
        const response = await axiosClient.post('/public/auth/login', { 
            username, 
            password 
        });
        
        return response.data;  // { accessToken: "jwt..." }
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}
```

---

### PASO 4: Componente Login

**Archivo: `src/pages/Login/Login.jsx`**

```jsx
import { useContext, useRef } from 'react';
import { login } from './services/login.service';
import { useNavigate } from 'react-router';
import AuthContext from '../../context/AuthContext';

function SignIn() {
    const ref = useRef();
    const nav = useNavigate();
    const context = useContext(AuthContext);

    const onSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(ref.current);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await login(data.username, data.password);
            
            localStorage.setItem('token', response.accessToken);
            context.setToken(response.accessToken);
            
            nav('/dashboard');
        } catch (error) {
            alert('Username o password incorrecto');
        }
    };

    return (
        // Formulario con username y password
    );
}

export default SignIn;
```

---

### PASO 5: Ruta Protegida

**Archivo: `src/components/ProtectedRoute.jsx`**

```jsx
import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import AuthContext from "../context/AuthContext";

export default function ProtectedRoute() {
    const { isAuthenticated } = useContext(AuthContext);
    const nav = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            nav("/auth/login");
        }
    }, [isAuthenticated, nav]);

    return <Outlet />;
}
```

---

# 📚 CRUD DE GAMES

## PASO 1: Crear Servicio de Games

**Archivo: `src/pages/Dashboard/services/games.service.js`**

Aquí es donde TÚ agregarás las funciones que faltan (CREATE, UPDATE, DELETE).

```javascript
import axiosClient from "../../../lib/axios/axiosClient";

// ===== READ (Obtener) =====

export async function getAllGames() {
    try {
        const response = await axiosClient.get('/games');
        console.log('Games fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching games:', error);
        throw error;
    }
}

// ===== TÚ COMPLETAS ESTAS =====

export async function createGame(gameData) {
    // TODO: Implementar POST /games
}

export async function updateGame(id, gameData) {
    // TODO: Implementar PUT /games/{id}
}

export async function deleteGame(id) {
    // TODO: Implementar DELETE /games/{id}
}
```

---

## PASO 2: Componente Dashboard con CRUD

**Archivo: `src/pages/Dashboard/Dashboard.jsx`**

**Estados necesarios:**
```javascript
const [games, setGames] = useState([]);            // Lista de games
const [openDialog, setOpenDialog] = useState(false);  // Modal abierto?
const [editingGame, setEditingGame] = useState(null); // Editando cuál?
const [formData, setFormData] = useState({...});   // Datos del formulario
```

**Funciones necesarias:**
```javascript
loadGames()      // GET - cargar todos
handleSave()     // POST (crear) o PUT (actualizar)
handleDelete()   // DELETE
handleEdit()     // Abrir modal para editar
handleNew()      // Abrir modal para crear
```

**Actualizar lista después de operaciones:**
```javascript
// CREATE
setGames([...games, created]);

// UPDATE
setGames(games.map(g => g.id === updated.id ? updated : g));

// DELETE
setGames(games.filter(g => g.id !== id));
```

---

# ⚠️ ERRORES COMUNES

## 1. Error: baseURL is undefined
**Causa:** No creaste `.env`

**Solución:**
```env
VITE_API_URL=http://localhost:8081/compunet2-2026/rest
```

---

## 2. Error 401: Token inválido
**Causa:** El token no se envía o está expirado

**Debugging:**
```javascript
console.log(localStorage.getItem('token'));
// Si está vacío → login no guardó el token
```

---

## 3. Error: "Cannot read property 'name' of undefined"
**Causa:** `games` es undefined

**Solución:**
```javascript
const [games, setGames] = useState([]);  // ✅ Array vacío
```

---

## 4. Error: "Cannot find module"
**Causa:** Ruta de import incorrecta

**Debugging:**
```javascript
// Si estás en: src/pages/Dashboard/Dashboard.jsx
// Contar carpetas: .. (Dashboard) → .. (pages) → .. (src)
// Luego: lib/axios/axiosClient.js

// Correcto:
import axiosClient from "../../../lib/axios/axiosClient";
```

---

## 5. Error: "POST /games 400 Bad Request"
**Causa:** Datos mal formados

**Debugging:**
```javascript
console.log("Enviando:", gameData);
// Verificar que tenga: name, description, minPlayers, maxPlayers, category, userId
```

---

## 6. No se actualiza la lista
**Causa:** No actualizas el estado después de operación

**Correcto:**
```javascript
const created = await createGame(formData);
setGames([...games, created]);  // ← IMPORTANTE
```

---

## 7. Form no se resetea
**Solución:**
```javascript
setFormData({
    name: '',
    description: '',
    minPlayers: 1,
    maxPlayers: 4,
    category: '',
    userId: 1
});
```

---

# ⚠️ ADAPTACIÓN AL BACKEND - MÁS IMPORTANTE

**Los atributos del código que te mostré (name, description, minPlayers, etc.) dependen 100% del backend.**

Si el backend cambia, TÚ adaptas. Aquí te muestro QUÉ cambiaría en cada sección:

---

## 1️⃣ Si la Entidad NO es "Games"

**Ejemplo:** Si el parcial te pide CRUD de **"Comments"** en lugar de "Games"

### En games.service.js

```javascript
// ❌ INCORRECTO (sigue siendo Games)
axiosClient.get('/games')

// ✅ CORRECTO (ahora es Comments)
axiosClient.get('/comments')

// TODO el servicio cambia:
export async function getAllComments() {
    const response = await axiosClient.get('/comments');
    return response.data;
}
export async function createComment(commentData) {
    const response = await axiosClient.post('/comments', commentData);
    return response.data;
}
// Etc...
```

---

## 2️⃣ Si los Campos Cambian

**Ejemplo:** Backend dice que Comments tiene: `text`, `authorId`, `postId` (no name, description)

### En Dashboard

```javascript
// ❌ INCORRECTO (campos de Games)
const [formData, setFormData] = useState({
    name: '',
    description: '',
    minPlayers: 1,
    maxPlayers: 4,
    category: '',
    userId: 1
});

// ✅ CORRECTO (campos de Comments)
const [formData, setFormData] = useState({
    text: '',
    authorId: 1,
    postId: 1
});
```

### En el Modal

```javascript
// ❌ INCORRECTO
<TextField name="name" ... />
<TextField name="description" ... />
<TextField name="minPlayers" ... />

// ✅ CORRECTO
<TextField name="text" ... multiline rows={4} />
<TextField name="authorId" ... type="number" />
<TextField name="postId" ... type="number" />
```

---

## 3️⃣ Si los Endpoints Cambian

**Ejemplo:** Si el backend usa `/comments` en lugar de `/games`

### En games.service.js (ahora sería comments.service.js)

```javascript
// Cambias TODAS las rutas:
axiosClient.get('/games')  → axiosClient.get('/comments')
axiosClient.post('/games', data) → axiosClient.post('/comments', data)
axiosClient.put(`/games/${id}`, data) → axiosClient.put(`/comments/${id}`, data)
axiosClient.delete(`/games/${id}`) → axiosClient.delete(`/comments/${id}`)
```

### En Dashboard.jsx

```javascript
// Cambias los imports:
import { getAllGames, createGame, updateGame, deleteGame } from "./services/games.service";
// Por:
import { getAllComments, createComment, updateComment, deleteComment } from "./services/comments.service";

// Y actualizas las llamadas:
const gamesData = await getAllGames();  // Por:
const commentsData = await getAllComments();
```

---

## 4️⃣ Si la Base de Datos Cambia

**Ejemplo:** Si no hay campo `userId` en Comments

```javascript
// ❌ Si envías un campo que NO existe en BD:
const response = await axiosClient.post('/comments', {
    text: "Hola",
    userId: 1  // ← Backend dice: "¿Qué es userId? No existe en Comments"
              // → Error 400 Bad Request
});

// ✅ Envía SOLO lo que el backend espera:
const response = await axiosClient.post('/comments', {
    text: "Hola",
    // Nada más, si eso es lo que espera
});
```

---

## 5️⃣ Si la Respuesta del Backend Cambia

**Ejemplo:** Backend devuelve diferente estructura

```javascript
// Si antes Games devolvía:
{
    id: 1,
    name: "Chess",
    description: "...",
    minPlayers: 2,
    maxPlayers: 2,
    category: "Strategy",
    userId: 1
}

// Pero Comments devuelve:
{
    id: 1,
    text: "Excelente juego",
    author: "admin",       // No autorId, sino author completo
    createdAt: "2026-06-03",  // Campo nuevo
    postId: 5
}

// TÚ adaptas el componente:
<Typography>{comment.author}</Typography>  // ← Cambió
<Typography>{comment.createdAt}</Typography>  // ← Nuevo campo
```

---

## 🎯 RESUMEN - CHECKLIST DE ADAPTACIÓN

Cuando recibas el backend en el parcial:

- [ ] **Lee la documentación** de qué entidad es (Games, Comments, Posts, etc.)
- [ ] **Identifica los campos** (name, description, text, content, etc.)
- [ ] **Actualiza formData** con los campos correctos
- [ ] **Actualiza TextFields** del modal
- [ ] **Actualiza el service** con la ruta correcta (`/games` → `/comments`)
- [ ] **Actualiza imports** en Dashboard
- [ ] **Actualiza handleChange** si hay tipos especiales (dates, numbers, etc.)
- [ ] **Prueba en consola** qué devuelve realmente el backend

**Ejemplo completo de adaptación:**

```javascript
// Backend dice: POST /comments { text, postId } → devuelve { id, text, postId, createdAt, author }

// 1. Service:
export async function createComment(commentData) {
    return (await axiosClient.post('/comments', commentData)).data;
}

// 2. formData:
const [formData, setFormData] = useState({ text: '', postId: 1 });

// 3. TextField:
<TextField name="text" value={formData.text} onChange={handleChange} />
<TextField name="postId" value={formData.postId} onChange={handleChange} type="number" />

// 4. handleSave:
const created = await createComment(formData);
setComments([...comments, created]);

// 5. Mostrar en lista:
<Typography>{comment.text}</Typography>
<Typography>{comment.author}</Typography>
<Typography>{comment.createdAt}</Typography>
```

---

# ✅ CHECKLIST FINAL

- [ ] Entiendo qué es JWT y cómo funciona
- [ ] Sé qué es un endpoint y cómo leerlo
- [ ] Entiendo GET, POST, PUT, DELETE
- [ ] Sé cómo escribir URLs correctamente
- [ ] Entiendo Router.jsx y rutas protegidas
- [ ] Sé cómo crear un servicio con axios
- [ ] Manejo useState y useEffect correctamente
- [ ] Sé cómo actualizar listas (CREATE/UPDATE/DELETE)
- [ ] Puedo debuggear errores comunes
- [ ] Puedo hacer CRUD desde cero (sin copiar)
- [ ] Entiendo que todo depende del backend
- [ ] Puedo adaptar código si cambio de entidad

---

# 🚀 ¡ÉXITO EN EL PARCIAL! 💪
