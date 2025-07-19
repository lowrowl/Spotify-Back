import express from "express";
const router = express.Router()

import {createPlaylist} from "../controllers/Playlist/playlistCreateController.js"
import {modifyPlaylist} from "../controllers/Playlist/playlistModifyController.js"
import {deletePlaylist} from "../controllers/Playlist/playlistDeleteController.js"
import {getPlaylistById} from "../controllers/Playlist/playlistGetByIdController.js"

// Modificar Playlist

router.put('/modify-playlist', modifyPlaylist);

// Eliminar Playlist

router.delete('/delete-playlist', deletePlaylist);

// Obtener Playlist por ID

router.get('/get-playlist/:idPlaylist', getPlaylistById);

// Añadir Playlist

router.post('/add-playlist', createPlaylist);

export default router
