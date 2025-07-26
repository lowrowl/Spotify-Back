import {
  getTrackByIdDeezer,
  searchTracksDeezer,
  searchDeezerTracksByArtist,
  getRecommendedTracks,
  getPopularTracksDeezer,
  getRecommendedArtists,
  getRecommendedGenres
} from '../services/deezerServices.js';

import Playlist from '../models/Playlist.js';

/**
 * Buscar canciones por nombre (ignora el tipo por ahora)
 */
export const searchTracks = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Falta el parámetro de búsqueda (query).' });
  }

  try {
    const results = await searchTracksDeezer(query);
    res.json(results);
  } catch (error) {
    console.error('Error al buscar canciones en Deezer:', error.message);
    res.status(500).json({ error: 'Error interno al buscar canciones.' });
  }
};

/**
 * Obtener una canción por su ID en Deezer
 */
export const getTrackById = async (req, res) => {
  const { id } = req.params;

  try {
    const track = await getTrackByIdDeezer(id);
    if (!track) {
      return res.status(404).json({ error: 'Canción no encontrada.' });
    }
    res.json(track);
  } catch (error) {
    console.error('Error al obtener canción por ID:', error.message);
    res.status(500).json({ error: 'Error interno al buscar la canción.' });
  }
};

/**
 * Obtener canciones similares por artista
 */
export const getSimilarTracks = async (req, res) => {
  const { id } = req.params;
  console.log('🔍 Buscando canciones similares para ID:', id);

  try {
    const originalTrack = await getTrackByIdDeezer(id);
    console.log('🎵 Track original:', originalTrack);

    if (!originalTrack) {
      return res.status(404).json({ error: 'Canción no encontrada.' });
    }

    const artistName = originalTrack.artist?.name;
    if (!artistName) {
      return res.status(404).json({ error: 'Artista no encontrado en la canción.' });
    }
    console.log('👤 Artista detectado:', artistName);

    const similarTracks = await searchDeezerTracksByArtist(artistName);
    console.log('🎶 Tracks similares encontrados:', similarTracks.length);

    const filtered = similarTracks
      .filter(track => track.id !== originalTrack.id)
      .slice(0, 5);

    return res.status(200).json(filtered);
  } catch (error) {
    console.error('❌ Error al obtener canciones similares:', error);
    return res.status(500).json({ error: 'Error al buscar canciones similares' });
  }
};

/**
 * Obtener recomendaciones basadas en un track
 */
export const getRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'id es requerido' });
    }

    const recommendations = await getRecommendedTracks(id);
    return res.json(recommendations);
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error.message);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * Reproducir preview de una canción por su ID
 */
export const playPreview = async (req, res) => {
  try {
    const { id } = req.params;
    const track = await getTrackByIdDeezer(id);

    if (!track || !track.preview) {
      return res.status(404).json({ error: 'Canción no encontrada.' });
    }

    return res.redirect(track.preview);
  } catch (error) {
    console.error("Error en playPreview:", error.message);
    return res.status(500).json({ error: "No se pudo redirigir al preview" });
  }
};

/**
 * Obtener datos para pantalla de inicio (home)
 */
export const getHomeData = async (req, res) => {
  try {
    const userId = req.user.id;

    const playlists = await Playlist.find({ createdBy: userId }).populate('idSong');
    const recommendedTracks = await getPopularTracksDeezer();
    const recommendedArtists = await getRecommendedArtists();
    const recommendedGenres = await getRecommendedGenres();

    return res.json({
      playlists,
      recommendedTracks,
      recommendedArtists: recommendedArtists.slice(0, 5),
      recommendedGenres: recommendedGenres.slice(0, 5),
    });
  } catch (error) {
    console.error('Error en getHomeData:', error);
    res.status(500).json({ error: 'Error al cargar la pantalla de inicio' });
  }
};
