import axios from 'axios';

const BASE_URL = 'https://api.deezer.com';

// 🎵 Formato estándar de una canción
const parseDeezerTrack = (track) => ({
  id: track.id,
  title: track.title,
  artist: {
    id: track.artist.id,
    name: track.artist.name,
    picture_medium: track.artist.picture_medium || null,
  },
  album: {
    id: track.album.id,
    title: track.album.title,
    cover_medium: track.album.cover_medium || null,
  },
  duration: track.duration,
  preview: track.preview,
  link: track.link,
});

// 🔍 Buscar canciones por nombre
export const searchDeezerTracksByName = async (query) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/search/track`, {
      params: { q: query },
    });
    return data.data.map(parseDeezerTrack);
  } catch (error) {
    console.error('Error buscando tracks por nombre en Deezer:', error.message);
    return [];
  }
};

// 🔍 Buscar canciones por artista
export const searchDeezerTracksByArtist = async (artistName) => {
  try {
    const { data: artistSearch } = await axios.get(`${BASE_URL}/search/artist`, {
      params: { q: artistName },
    });

    const artist = artistSearch.data[0];
    if (!artist || !artist.id) return [];

    const { data: topTracks } = await axios.get(`${BASE_URL}/artist/${artist.id}/top`, {
      params: { limit: 20 },
    });

    return topTracks.data.map(parseDeezerTrack);
  } catch (error) {
    console.error('Error buscando tracks por artista en Deezer:', error.message);
    return [];
  }
};

// 🔝 Tracks populares globales
export const getPopularTracksDeezer = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/chart/0/tracks`);
    return data.data.map(parseDeezerTrack);
  } catch (error) {
    console.error('Error obteniendo canciones populares de Deezer:', error.message);
    return [];
  }
};

// 🎨 Artistas populares globales
export const getRecommendedArtists = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/chart/0/artists`);
    return data.data.map((artist) => ({
      id: artist.id,
      name: artist.name,
      picture_medium: artist.picture_medium,
      link: artist.link,
    }));
  } catch (error) {
    console.error('Error obteniendo artistas recomendados de Deezer:', error.message);
    return [];
  }
};

// 🏷️ Géneros disponibles
export const getRecommendedGenres = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/genre`);
    return data.data.map((genre) => ({
      id: genre.id,
      name: genre.name,
      picture: genre.picture_medium,
    }));
  } catch (error) {
    console.error('Error obteniendo géneros de Deezer:', error.message);
    return [];
  }
};

// 🔁 Recomendaciones similares a una canción
export const getRecommendedTracks = async (trackId) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/track/${trackId}/radio`);
    const filtered = data.data.filter((track) => track.id !== trackId).slice(0, 5);
    return filtered.map(parseDeezerTrack);
  } catch (error) {
    console.error('Error obteniendo recomendaciones similares:', error.message);
    return [];
  }
};

export const getTrackByIdDeezer = async (trackId) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/track/${trackId}`);
    return parseDeezerTrack(data);
  } catch (error) {
    console.error('Error obteniendo track por ID:', error.message);
    return null;
  }
};

// 🔎 Buscar canciones por nombre o artista (unificado)
export const searchTracksDeezer = async (query) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/search`, {
      params: { q: query },
    });

    return data.data.map(parseDeezerTrack);
  } catch (error) {
    console.error('Error en búsqueda unificada en Deezer:', error.message);
    return [];
  }
};