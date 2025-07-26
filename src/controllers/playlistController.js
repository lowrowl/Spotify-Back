import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';
import mongoose from 'mongoose';

// Crear una nueva playlist
export const createPlaylist = async (req, res) => {
  const { name } = req.body;
  const createdBy = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'El nombre de la playlist es obligatorio' });
  }

  try {
    const newPlaylist = new Playlist({ name, createdBy, idSong: [] });
    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Error al crear playlist:', error);
    res.status(500).json({ error: 'No se pudo crear la playlist' });
  }
};

// Obtener todas las playlists del usuario
// Obtener todas las playlists del usuario con detalles visuales
export const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user.id })
      .populate({
        path: 'idSong',
        select: 'title artist album cover preview deezerId'  // Campos visuales
      });

    res.json(playlists);
  } catch (error) {
    console.error('Error al obtener playlists:', error);
    res.status(500).json({ error: 'Error al obtener las playlists' });
  }
};


// Obtener una playlist por ID
export const getPlaylistById = async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await Playlist.findById(id).populate('idSong');
    if (!playlist) return res.status(404).json({ error: 'Playlist no encontrada' });

    if (playlist.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a esta playlist' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Error al obtener playlist:', error);
    res.status(500).json({ error: 'Error al obtener la playlist' });
  }
};

// Editar una playlist
export const updatePlaylist = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ error: 'Playlist no encontrada' });

    if (playlist.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para editar esta playlist' });
    }

    playlist.name = name || playlist.name;
    await playlist.save();

    res.json({ message: 'Playlist actualizada', playlist });
  } catch (error) {
    console.error('Error al actualizar playlist:', error);
    res.status(500).json({ error: 'Error al actualizar la playlist' });
  }
};

// Eliminar playlist
export const deletePlaylist = async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ error: 'Playlist no encontrada' });

    if (playlist.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para eliminar esta playlist' });
    }

    await playlist.deleteOne();
    res.json({ message: 'Playlist eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar playlist:', error);
    res.status(500).json({ error: 'No se pudo eliminar la playlist' });
  }
};

import { getTrackByIdDeezer } from '../services/deezerServices.js';

// Añadir una canción a la playlist usando deezerId
export const addSongToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { songId } = req.body; // songId = deezerId

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist no encontrada' });

    // Verificar si ya está en la base de datos
    let song = await Song.findOne({ deezerId: songId });

    // Si no está, obtener desde Deezer y guardar
    if (!song) {
      const trackData = await getTrackByIdDeezer(songId);
      if (!trackData) {
        return res.status(404).json({ error: 'Canción no encontrada en Deezer' });
      }

      song = new Song({
        title: trackData.title,
        artist: trackData.artist.name,
        album: trackData.album.title,
        preview: trackData.preview,
        cover: trackData.album.cover_medium,
        deezerId: trackData.id,
      });

      await song.save();
    }

    // Verificar duplicado
    if (!playlist.idSong.includes(song._id)) {
      playlist.idSong.push(song._id);
      await playlist.save();
    }

    const populated = await Playlist.findById(playlistId).populate('idSong');
    res.json(populated);
  } catch (error) {
    console.error('Error al añadir canción:', error);
    res.status(500).json({ error: 'Error al añadir canción a la playlist' });
  }
};


// Eliminar una canción de una playlist
export const removeSongFromPlaylist = async (req, res) => {
  const { playlistId, songId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist no encontrada' });

    // Elimina el deezerId directamente
    playlist.idSong = playlist.idSong.filter(id => id !== Number(songId));

    await playlist.save();
    res.json({ message: 'Canción eliminada de la playlist', playlist });
  } catch (error) {
    console.error('Error al eliminar canción:', error);
    res.status(500).json({ error: 'Error al eliminar la canción' });
  }
};