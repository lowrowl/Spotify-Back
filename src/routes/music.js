import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import Spotify from '../services/Spotify.js';
import Playlist from '../../Playlist.js';
import Songs from '../models/Songs.js';
import Artist from '../models/Artist.js';
import mongoose from 'mongoose';

const router = express.Router();
const spotifyClient = new Spotify();

const saveOrGetSongId = async (spotifyTrack) => {
  try {
    let song = await Songs.findOne({ name: spotifyTrack.name, 'idArtist.name': spotifyTrack.artists[0].name });

    if (!song) {
      const artistNames = spotifyTrack.artists;
      const artistIds = [];

      for (const artistName of artistNames) {
        let artist = await Artist.findOne({ name: artistName });
        if (!artist) {
          artist = new Artist({
            name: artistName,
            genres: [],
            image: null,
            popularity: 0,
          });
          await artist.save();
        }
        artistIds.push(artist._id);
      }

      song = new Songs({
        name: spotifyTrack.name,
        genres: spotifyTrack.genres || [],
        duration: spotifyTrack.duration_ms,
        image: spotifyTrack.album.images[0]?.url || '',
        url_cancion: spotifyTrack.external_urls.spotify,
        idArtist: artistIds,
      });
      await song.save();
    }
    return song._id;
  } catch (error) {
    console.error('Error in saveOrGetSongId:', error);
    throw error;
  }
};

router.get('/search', authenticateUser, async (req, res) => {
  const { query, type } = req.query;

  if (!query || !type) {
    return res.status(400).json({ error: 'Parámetros de búsqueda inválidos' });
  }

  try {
    let result;
    if (type === 'track') {
      result = await spotifyClient.getTracks({ by: 'name', param: query });
    } else if (type === 'artist') {
      result = await spotifyClient.getTracks({ by: 'artist', param: query });
    } else {
      return res.status(400).json({ error: 'Tipo de búsqueda no soportado. Use "track" o "artist".' });
    }

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Error searching Spotify:', error);
    res.status(500).json({ error: 'Error al buscar en Spotify' });
  }
});

router.post('/playlists', authenticateUser, async (req, res) => {
  const { name } = req.body;
  const createdBy = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'El nombre de la playlist es obligatorio' });
  }

  try {
    const newPlaylist = new Playlist({ name, createdBy, songs: [] });
    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Error al crear la playlist' });
  }
});

router.post('/playlists/:playlistId/songs', authenticateUser, async (req, res) => {
  const { playlistId } = req.params;
  const { spotifyTrack } = req.body;

  if (!spotifyTrack || !spotifyTrack.id) {
    return res.status(400).json({ error: 'Datos de la canción de Spotify inválidos' });
  }

  try {
    const songId = await saveOrGetSongId(spotifyTrack);

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    if (!playlist.idSong.includes(songId)) {
      playlist.idSong.push(songId);
      await playlist.save();
    } else {
      return res.status(409).json({ message: 'La canción ya existe en esta playlist' });
    }

    const populatedPlaylist = await Playlist.findById(playlist._id).populate('idSong');
    res.status(200).json(populatedPlaylist);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ error: 'Error al añadir canción a la playlist' });
  }
});

router.get('/playlists', authenticateUser, async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user.id }).populate('idSong');
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Error al obtener las playlists' });
  }
});

router.get('/playlists/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await Playlist.findById(id).populate('idSong');
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }
    if (playlist.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Acceso no autorizado a esta playlist' });
    }
    res.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist by ID:', error);
    res.status(500).json({ error: 'Error al obtener la playlist' });
  }
});

router.delete('/playlists/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await Playlist.findByIdAndDelete(id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    res.json({ message: 'Playlist eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Error al eliminar la playlist' });
  }
});

router.delete('/playlists/:playlistId/songs/:songId', authenticateUser, async (req, res) => {
  const { playlistId, songId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    playlist.idSong = playlist.idSong.filter((sId) => !sId.equals(new mongoose.Types.ObjectId(songId)));

    const updatedPlaylist = await playlist.save();
    const populatedPlaylist = await Playlist.findById(updatedPlaylist._id).populate('idSong');
    res.json(populatedPlaylist);
  } catch (error) {
    console.error('Error deleting song from playlist:', error);
    res.status(500).json({ error: 'Error al eliminar la canción de la playlist' });
  }
});

export default router;