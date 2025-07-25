import express from 'express';
import { authenticateUser } from '../../src/middleware/authMiddleware.js'; // Adjust path as per your project structure
import Spotify from '../services/Spotify.js'; // <- Corrige la ruta de utils a services
import Playlist from '../models/Playlist.js'; // Your Playlist model
import Songs from '../models/Songs.js'; // Your Songs model
import Artist from '../models/Artist.js'; // Your Artist model
import mongoose from 'mongoose'; // Import mongoose for ObjectId

const router = express.Router();
const spotifyClient = new Spotify();

// Helper function to save a song to the Songs collection if it doesn't exist
const saveOrGetSongId = async (spotifyTrack) => {
  try {
    let song = await Songs.findOne({ name: spotifyTrack.name, 'idArtist.name': spotifyTrack.artists[0].name }); // Find by name and first artist

    if (!song) {
      // If song not found, create new song entry
      const artistNames = spotifyTrack.artists;
      const artistIds = [];

      for (const artistName of artistNames) {
        let artist = await Artist.findOne({ name: artistName });
        if (!artist) {
          // If artist doesn't exist, create a new one (with minimal data for now)
          artist = new Artist({
            name: artistName,
            genres: [], // Spotify API search might not give genres directly here, can be updated later
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
        duration: spotifyTrack.duration_ms, // Spotify returns duration in ms
        image: spotifyTrack.imageUrl,
        url_cancion: spotifyTrack.preview_url || null, // Assuming preview_url is available
        idArtist: artistIds,
      });
      await song.save();
    }
    return song._id;
  } catch (error) {
    console.error('Error saving or getting song ID:', error);
    throw new Error('Failed to save or retrieve song ID');
  }
};


// Route for searching songs and artists
router.get('/search', authenticateUser, async (req, res) => {
  const { query, type = 'track,artist', limit = 50, offset = 0 } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'El término de búsqueda es obligatorio' });
  }

  try {
    const searchResults = await spotifyClient.getTracks({
      by: 'name', // Using 'name' for general search across tracks/artists
      param: query,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (searchResults.error) {
        return res.status(500).json({ error: searchResults.error });
    }

    // The spotifyClient.getTracks should ideally return separated tracks and artists,
    // but based on its current implementation (from provided Spotify.js), it seems
    // to return tracks directly when 'by' is 'name'.
    // If you need artists as well, you might need to adjust Spotify.js or make a separate call.

    // For now, assuming searchResults contains tracks and artists based on the original request
    const tracks = searchResults.tracks || searchResults; // Adjust based on actual spotifyClient.getTracks return
    const artists = searchResults.artists || []; // Assuming artists are also returned or can be extracted

    res.json({ tracks, artists });
  } catch (error) {
    console.error('Error searching Spotify:', error.message);
    res.status(500).json({ error: 'Error al buscar canciones o artistas' });
  }
});

// Route to get playlists for a user
router.get('/playlists', authenticateUser, async (req, res) => {
  try {
    // Populate the idSong array with actual song documents
    const playlists = await Playlist.find({ createdBy: req.user.id }).populate('idSong');
    res.json(playlists);
  } catch (error) {
    console.error('Error getting playlists:', error);
    res.status(500).json({ error: 'Error al obtener las playlists' });
  }
});

// Route to create a new playlist
router.post('/playlists', authenticateUser, async (req, res) => {
  const { name, image, songs = [] } = req.body; // 'songs' should be an array of Spotify track objects

  if (!name || !image) {
    return res.status(400).json({ error: 'El nombre y la imagen de la playlist son obligatorios' });
  }

  try {
    const songIds = [];
    for (const spotifyTrack of songs) {
      const songId = await saveOrGetSongId(spotifyTrack);
      songIds.push(songId);
    }

    const newPlaylist = new Playlist({
      name,
      image,
      idSong: songIds,
      createdBy: req.user.id,
    });

    const savedPlaylist = await newPlaylist.save();
    // Populate the songs before sending the response
    const populatedPlaylist = await Playlist.findById(savedPlaylist._id).populate('idSong');
    res.status(201).json(populatedPlaylist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Error al crear la playlist' });
  }
});

// Route to add a song to an existing playlist
router.post('/playlists/:playlistId/songs', authenticateUser, async (req, res) => {
  const { playlistId } = req.params;
  const { song: spotifyTrack } = req.body; // 'song' should be a Spotify track object

  if (!spotifyTrack || !spotifyTrack.id || !spotifyTrack.name || !spotifyTrack.artists) {
    return res.status(400).json({ error: 'Los datos de la canción son obligatorios (id, name, artists).' });
  }

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    // Save or get the song's _id from your Songs collection
    const songDbId = await saveOrGetSongId(spotifyTrack);

    // Check if the song (by its _id) is already in the playlist to avoid duplicates
    const isSongAlreadyInPlaylist = playlist.idSong.some(sId => sId.equals(songDbId));

    if (isSongAlreadyInPlaylist) {
      return res.status(409).json({ error: 'La canción ya existe en esta playlist.' });
    }

    playlist.idSong.push(songDbId);
    const updatedPlaylist = await playlist.save();
    // Populate the songs before sending the response
    const populatedPlaylist = await Playlist.findById(updatedPlaylist._id).populate('idSong');
    res.json(populatedPlaylist);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ error: 'Error al agregar la canción a la playlist' });
  }
});

// Route to delete a playlist
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

// Route to delete a song from a playlist
router.delete('/playlists/:playlistId/songs/:songId', authenticateUser, async (req, res) => {
  const { playlistId, songId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    // Filter out the song based on its _id
    // Ensure songId is a valid ObjectId before comparison
    playlist.idSong = playlist.idSong.filter((sId) => !sId.equals(new mongoose.Types.ObjectId(songId)));

    const updatedPlaylist = await playlist.save();
    // Populate the songs before sending the response
    const populatedPlaylist = await Playlist.findById(updatedPlaylist._id).populate('idSong');
    res.json(populatedPlaylist);
  } catch (error) {
    console.error('Error deleting song from playlist:', error);
    res.status(500).json({ error: 'Error al eliminar la canción de la playlist' });
  }
});

export default router;