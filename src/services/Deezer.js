// src/services/deezer.js
import axios from 'axios';

export const searchDeezerTracks = async (query) => {
  try {
    const response = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
    const data = response.data?.data;

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist?.name,
      album: track.album?.title,
      imageUrl: track.album?.cover_medium,
      previewUrl: track.preview, // 🎯 esta es la URL que puedes usar en el frontend
      deezerUrl: track.link,
    }));
  } catch (error) {
    console.error('Error buscando canciones en Deezer:', error.message);
    return { error: 'No se pudo conectar con Deezer' };
  }
};
