import axios from 'axios';

const BASE_URL = 'https://api.deezer.com';

// Función para limpiar resultados de canciones
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
  preview: track.preview, // URL al preview de 30 segundos
  link: track.link,       // Enlace a Deezer
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
