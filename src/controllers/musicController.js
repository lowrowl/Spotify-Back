import {
  searchTracksDeezer,
  getTrackByIdDeezer,
  getPopularTracksDeezer
} from '../services/deezerServices.js';

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

  try {
    // 1. Obtener la canción original
    const originalTrack = await deezerService.getTrackById(id);
    if (!originalTrack) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    const mainArtist = originalTrack.artists[0];
    if (!mainArtist) {
      return res.status(404).json({ error: 'Artista no encontrado en la canción' });
    }

    // 2. Obtener top canciones del artista
    const similarTracks = await deezerService.getTracksByArtist(mainArtist, 10);

    // 3. Filtrar la canción original y limitar a 5
    const filteredTracks = similarTracks
      .filter((track) => track.id !== originalTrack.id)
      .slice(0, 5);

    return res.status(200).json(filteredTracks);
  } catch (error) {
    console.error('Error al obtener canciones similares:', error);
    res.status(500).json({ error: 'Error al buscar canciones similares' });
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
    const { trackId } = req.params;
    if (!trackId) {
      return res.status(400).json({ error: 'trackId es requerido' });
    }

    const recommendations = await getRecommendedTracks(trackId);
    return res.json(recommendations);
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error.message);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const playPreview = async (req, res) => {
  try {
    const { previewUrl } = req.query;

    if (!previewUrl) {
      return res.status(400).json({ error: "Se requiere la URL del preview" });
    }

    return res.redirect(previewUrl);
  } catch (error) {
    console.error("Error en playPreview:", error.message);
    return res.status(500).json({ error: "No se pudo redirigir al preview" });
  }
};
