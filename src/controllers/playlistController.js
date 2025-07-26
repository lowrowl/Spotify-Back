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
export const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user.id }).populate('idSong');
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

// Añadir una canción a la playlist
export const addSongToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { songId } = req.body;

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist no encontrada' });

    // Evitar duplicados
    if (!playlist.idSong.includes(songId)) {
      playlist.idSong.push(songId); // ← Solo push directo del número
      await playlist.save();
    }

    res.json(playlist);
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

    playlist.idSong = playlist.idSong.filter(
      (sId) => !sId.equals(new mongoose.Types.ObjectId(songId))
    );

    const updated = await playlist.save();
    const populated = await Playlist.findById(updated._id).populate('idSong');

    res.json(populated);
  } catch (error) {
    console.error('Error al eliminar canción:', error);
    res.status(500).json({ error: 'Error al eliminar la canción' });
  }
};
