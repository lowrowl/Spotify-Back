import express from 'express';
import {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from '../controllers/playlistController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateUser, createPlaylist);
router.get('/', authenticateUser, getMyPlaylists);
router.get('/:id', authenticateUser, getPlaylistById);
router.put('/:id', authenticateUser, updatePlaylist);
router.delete('/:id', authenticateUser, deletePlaylist);
router.post('/:playlistId/songs', authenticateUser, addSongToPlaylist);
router.delete('/:playlistId/songs/:songId', authenticateUser, removeSongFromPlaylist);

export default router;
