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

export async function getGameById(id) {
    try {
        const response = await axiosClient.get(`/games/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching game:', error);
        throw error;
    }
}

// ===== CREATE (Crear) =====

export async function createGame(gameData) {
    try {
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
        const response = await axiosClient.delete(`/games/${id}`);
        console.log('Game deleted successfully');
        return response.data;
    } catch (error) {
        console.error('Error deleting game:', error);
        throw error;
    }
}