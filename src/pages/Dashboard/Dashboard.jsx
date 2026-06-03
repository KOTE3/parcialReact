import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { getAllGames, createGame, updateGame, deleteGame } from "./services/games.service";

export default function Dashboard() {
    // Estado: lista de games
    const [games, setGames] = useState([]);
    
    // Estado: modal abierto/cerrado
    const [openDialog, setOpenDialog] = useState(false);
    
    // Estado: si estamos editando (null = crear nuevo, number = editar)
    const [editingGame, setEditingGame] = useState(null);
    
    // Estado: datos del formulario
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        minPlayers: 1,
        maxPlayers: 4,
        category: '',
        userId: 1
    });

    // Cargar games al montar componente
    useEffect(() => {
        loadGames();
    }, []);

    // Función: traer todos los games
    const loadGames = async () => {
        try {
            const gamesData = await getAllGames();
            setGames(gamesData);
        } catch (error) {
            console.error('Error fetching games:', error);
            alert('Error al cargar games');
        }
    };

    // Función: abrir modal para crear nuevo game
    const handleNew = () => {
        setEditingGame(null);
        setFormData({ name: '', description: '', minPlayers: 1, maxPlayers: 4, category: '', userId: 1 });
        setOpenDialog(true);
    };

    // Función: abrir modal para editar game
    const handleEdit = (game) => {
        setEditingGame(game.id);
        setFormData(game);
        setOpenDialog(true);
    };

    // Función: actualizar campo del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'minPlayers' || name === 'maxPlayers' || name === 'userId' ? parseInt(value) : value
        }));
    };

    // Función: guardar (crear o actualizar)
    const handleSave = async () => {
        try {
            if (editingGame) {
                // ACTUALIZAR
                const updated = await updateGame(editingGame, formData);
                setGames(games.map(g => g.id === updated.id ? updated : g));
            } else {
                // CREAR
                const created = await createGame(formData);
                setGames([...games, created]);
            }
            setOpenDialog(false);
        } catch (error) {
            console.error('Error saving game:', error);
            alert('Error al guardar');
        }
    };

    // Función: eliminar game
    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este game?')) {
            try {
                await deleteGame(id);
                setGames(games.filter(g => g.id !== id));
            } catch (error) {
                console.error('Error deleting game:', error);
                alert('Error al eliminar');
            }
        }
    };

    return (
        <Box style={{ padding: "2rem" }}>
            <Typography variant="h1" style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                Dashboard - Games ({games.length})
            </Typography>

            {/* Botón crear nuevo game */}
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNew}
                style={{ marginBottom: "1rem" }}
            >
                + Crear Game
            </Button>

            {/* Lista de games */}
            <Box>
                {games.map(game => (
                    <Box 
                        key={game.id} 
                        style={{ 
                            border: "1px solid #ccc", 
                            padding: "1rem", 
                            margin: "0.5rem 0", 
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <Box>
                            <Typography variant="h6">{game.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {game.description}
                            </Typography>
                            <Typography variant="caption">
                                {game.minPlayers}-{game.maxPlayers} jugadores | {game.category}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => handleEdit(game)}
                            >
                                Editar
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="error"
                                size="small"
                                onClick={() => handleDelete(game.id)}
                            >
                                Eliminar
                            </Button>
                        </Stack>
                    </Box>
                ))}
            </Box>

            {/* Modal para crear/editar */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {editingGame ? 'Editar Game' : 'Crear Game'}
                </DialogTitle>
                <DialogContent style={{ minWidth: "400px", paddingTop: "1rem" }}>
                    <TextField
                        fullWidth
                        label="Nombre"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Descripción"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        fullWidth
                        label="Min Jugadores"
                        name="minPlayers"
                        type="number"
                        value={formData.minPlayers}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Max Jugadores"
                        name="maxPlayers"
                        type="number"
                        value={formData.maxPlayers}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Categoría"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        {editingGame ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}