import express from 'express';
import {
  searchTracks,
  getTrackById,
  getSimilarTracks, // ✅ Asegúrate de incluir esta función
  getHomeData,
  getRecommendations,
  playPreview,
} from '../controllers/musicController.js';

import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Buscar canciones en Deezer
router.get('/search', authenticateUser, searchTracks);

// Obtener preview de canción por ID
router.get('/preview/:id', authenticateUser, playPreview);

// Obtener canción específica
router.get('/:id', authenticateUser, getTrackById);

// Obtener recomendación (siguiente canción similar)
router.get('/recommendation/:id', authenticateUser, getRecommendations);

router.get('/track/:id/similar', getSimilarTracks);

router.get('/home', authenticateUser, getHomeData);


export default router;
