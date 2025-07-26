import express from 'express';
import {
  searchTracks,
  getTrackById,
  getSimilarTracks,
  getHomeData,
  getRecommendations,
  playPreview,
} from '../controllers/musicController.js';

import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Las rutas más específicas deben ir primero

// Buscar canciones en Deezer
router.get('/search', authenticateUser, searchTracks);

// Obtener datos para pantalla de inicio
router.get('/home', authenticateUser, getHomeData);

// Reproducir preview de canción
router.get('/preview/:id', authenticateUser, playPreview);

// Obtener recomendaciones tipo radio
router.get('/recommendation/:id', authenticateUser, getRecommendations);

// Obtener canciones similares por artista
router.get('/track/:id/similar', authenticateUser, getSimilarTracks);

// Obtener canción específica por ID
router.get('/:id', authenticateUser, getTrackById); // Esta va de última

export default router;
