import express from 'express';
import {
  searchTracks,
  playPreview,
  uploadTrack,
  getTrackById,
  getRecommendations
} from '../controllers/musicController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { checkAuthorRole } from '../middleware/checkAuthorRole.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Buscar canciones en Deezer
router.get('/search', authenticateUser, searchTracks);

// Obtener preview de canción por ID
router.get('/preview/:id', authenticateUser, playPreview);

// Obtener canción específica
router.get('/:id', authenticateUser, getTrackById);

// Obtener recomendación (siguiente canción similar)
router.get('/recommendation/:id', authenticateUser, getRecommendations);

// Subir canción personalizada (solo usuarios con rol "author")
router.post('/upload', authenticateUser, checkAuthorRole, upload.single('audio'), uploadTrack);

router.get('/track/:id/similar', getSimilarTracks);

router.get('/home', authenticateUser, getHomeData);


export default router;
