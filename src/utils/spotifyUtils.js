const axios = require('axios');

let spotifyAccessToken = null; // Variable para almacenar el token en memoria
let tokenExpirationTime = null; // Variable para almacenar el tiempo de expiración del token

// Función para obtener un nuevo token de Spotify
const getSpotifyAccessToken = async () => {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    spotifyAccessToken = response.data.access_token;
    tokenExpirationTime = Date.now() + response.data.expires_in * 1000; // Calcula el tiempo de expiración

    console.log('Nuevo token de Spotify obtenido:', spotifyAccessToken);
  } catch (error) {
    console.error('Error al obtener el token de Spotify:', error.response?.data || error.message);
    throw new Error('No se pudo obtener el token de Spotify');
  }
};

// Función para obtener un token válido
const getValidSpotifyAccessToken = async () => {
  if (!spotifyAccessToken || Date.now() >= tokenExpirationTime) {
    await getSpotifyAccessToken(); // Obtén un nuevo token si no existe o ha expirado
  }
  return spotifyAccessToken;
};

module.exports = { getValidSpotifyAccessToken };