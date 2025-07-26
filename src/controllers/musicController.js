import {
  getTrackByIdDeezer,
  searchDeezerTracksByArtist // ← ESTO FALTABA
} from '../services/deezerServices.js';

import { getRecommendedTracks } from '../services/deezerServices.js';
/**
 * Buscar canciones por nombre, artista, álbum, etc.
 */
export const searchTracks = async (req, res) => {
  const { query, type } = req.query;

  if (!query || !type) {
    return res.status(400).json({ error: 'Faltan parámetros de búsqueda (query y type).' });
  }

  try {
    const results = await searchTracksDeezer(query, type);
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
 * Obtener canciones populares (top tracks)
 */
export const getPopularTracks = async (req, res) => {
  try {
    const tracks = await getPopularTracksDeezer();
    res.json(tracks);
  } catch (error) {
    console.error('Error al obtener canciones populares:', error.message);
    res.status(500).json({ error: 'Error al obtener canciones populares.' });
  }
}
// Nueva función para sugerencias
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

export const getHomeData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Playlists del usuario
    const playlists = await Playlist.find({ createdBy: userId }).populate('idSong');

    // 2. Música recomendada (puedes tomar aleatoriamente o top charts)
    const recommendedTracks = await deezerService.getTopTracks(10);

    // 3. Artistas recomendados (pueden venir de los artistas de esas canciones)
    const artistIds = [...new Set(recommendedTracks.flatMap(track => track.artists))];
    const recommendedArtists = await deezerService.getArtistsByIds(artistIds.slice(0, 5));

    // 4. Géneros recomendados (pueden ser los géneros de esas canciones o random)
    const genres = [...new Set(recommendedTracks.flatMap(track => track.genres))].slice(0, 5);

    return res.json({
      playlists,
      recommendedTracks,
      recommendedArtists,
      recommendedGenres: genres,
    });
  } catch (error) {
    console.error('Error en getHomeData:', error);
    res.status(500).json({ error: 'Error al cargar la pantalla de inicio' });
  }
};

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
