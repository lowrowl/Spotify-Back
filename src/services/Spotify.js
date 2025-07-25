// src/services/Spotify.js
"use strict";
import { apiFetch } from "./ApiFetch.js"; // Usa tu nuevo apiFetch
// import ytdl from 'ytdl-core'; // Si decides usar YouTube
// import axios from 'axios'; // Si usas axios para YouTube API

class Spotify {
  constructor() {}

  // Obtener canciones por id, por nombre y por artista
  getTracks = async ({ by, param, limit = 10, offset = 0 }) => {
    const byFormatted = by.toLowerCase();

    const option = {
      name: { type: "search", search: "track" },
      artist: { type: "search", search: "artist" },
      id: { type: "tracks" }, // Para obtener un track por ID
    };

    let result;
    try {
        result = await this.#useApiFetch({
            by: byFormatted,
            limit,
            offset,
            options: option,
            param: param,
        });
        if (result.error) throw new Error(result.error); // Propagar errores de apiFetch
    } catch (error) {
        console.error(`Error en #useApiFetch para ${byFormatted}: ${error.message}`);
        return { error: `Error al buscar en Spotify: ${error.message}` };
    }


    try {
      let theTracks = [];

      if (byFormatted === "name") {
        const arrayTracks = result["tracks"]?.items;
        if (!arrayTracks) {
            console.warn("No se encontraron tracks para la búsqueda por nombre.");
            return [];
        }
        const tracks = await this.#getTracksParsed({
          prop: arrayTracks,
        });
        theTracks = tracks;
      } else if (byFormatted === "id") {
        // Cuando buscas por ID, Spotify devuelve un solo objeto track directamente
        // #getTracksParsed espera un array o un objeto que pueda mapear
        const track = await this.#getTracksParsed({ prop: [result] }); // Envuelve en un array para consistencia
        theTracks = track; // Esto ya es un array con un elemento
      } else if (byFormatted === "artist") {
        const arrayArtist = result["artists"]?.items;
        if (!arrayArtist || arrayArtist.length === 0) {
            console.warn("No se encontraron artistas para la búsqueda por artista.");
            return [];
        }

        const artistParsed = await this.#getArtistParsed({
          prop: arrayArtist,
          isComplete: true,
        });

        for (let i in artistParsed) {
          const tracksByArtist = await this.#getTracksByArtist({
            idArtist: artistParsed[i].id,
            genres: artistParsed[i].genres, // Pasa los géneros del artista si están disponibles
          });
          theTracks = theTracks.concat(tracksByArtist);
        }
      }

      return theTracks;
    } catch (error) {
      console.error(`Hubo un error al procesar las canciones de Spotify: ${error.message}`);
      return { error: `Error al procesar canciones: ${error.message}` };
    }
  };

  // ... (métodos privados de tu Spotify.js actual)

  // Método privado para obtener y parsear tracks
  // AQUÍ ES DONDE AÑADES LA LÓGICA DE url_cancion
  #getTracksParsed = async ({ prop, imageUrl = false, genres = [] }) => {
    const arrayTracksPromises = (Array.isArray(prop) ? prop : [prop])?.map(
      async (track) => {
        let artists = [];
        if (track.artists) {
          artists = track.artists.map((artist) => artist.name);
        } else if (track.album?.artists) { // Algunas estructuras pueden tener el artista dentro del album
          artists = track.album.artists.map((artist) => artist.name);
        }

        let albumImage = imageUrl || track.album?.images[0]?.url || null;
        if (track.album?.images && track.album.images.length > 0) {
            albumImage = track.album.images[0].url;
        } else if (track.images && track.images.length > 0) { // Para casos donde la imagen es directa del track/album
            albumImage = track.images[0].url;
        }

        let trackGenres = genres;
        if (track.genres && track.genres.length > 0) {
            trackGenres = track.genres;
        } else if (track.album?.genres && track.album.genres.length > 0) {
            trackGenres = track.album.genres;
        }
        // Fallback si no hay géneros por otros medios, puedes intentar inferirlos
        if (trackGenres.length === 0 && track.artists && track.artists[0]?.id) {
            const artistData = await apiFetch({ type: "artist", body: { id: track.artists[0].id } });
            if (artistData?.genres && artistData.genres.length > 0) {
                trackGenres = artistData.genres;
            }
        }


        let songUrl = track.preview_url; // Intenta usar preview_url de Spotify primero

        // Lógica para obtener una URL alternativa si preview_url es nulo
        if (!songUrl) {
            console.log(`Preview URL nula para: ${track.name} por ${artists.join(', ')}. Buscando alternativa...`);
            // **Aquí iría la lógica para buscar en YouTube o similar**
            // EJEMPLO (requiere una API key de YouTube y axios):
            /*
            try {
                const youtubeQuery = `${track.name} ${artists[0] || ''} official audio`;
                const youtubeResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                    params: {
                        part: 'snippet',
                        q: youtubeQuery,
                        type: 'video',
                        maxResults: 1,
                        key: process.env.YOUTUBE_API_KEY // Necesitas una variable de entorno para tu clave de API de YouTube
                    }
                });
                if (youtubeResponse.data.items.length > 0) {
                    const videoId = youtubeResponse.data.items[0].id.videoId;
                    // Puedes usar la URL de embed o una que ytdl-core pueda procesar
                    songUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    console.log(`Encontrada URL de YouTube para ${track.name}: ${songUrl}`);
                    // Si quieres el stream directo, ytdl-core puede ayudarte, pero eso es más complejo para un preview rápido.
                    // const info = await ytdl.getInfo(videoId);
                    // const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
                    // songUrl = audioFormat.url;
                }
            } catch (youtubeError) {
                console.error(`Error al buscar en YouTube para ${track.name}:`, youtubeError.message);
                songUrl = null; // Si falla la búsqueda, sigue siendo nulo
            }
            */
            // Por ahora, si no hay preview_url y no hay lógica alternativa, será null
            // Considera poner una URL de audio de "no disponible" si lo deseas
            songUrl = null; // Mantener null si no se encuentra alternativa
        }


        return {
          id: track.id,
          name: track.name,
          artists: artists,
          album: track.album?.name || "Unknown Album",
          releaseDate: track.album?.release_date || "Unknown Date",
          imageUrl: albumImage,
          duration: track.duration_ms, // Duración en milisegundos
          url_cancion: songUrl, // Aquí se asigna la URL de reproducción
          genres: trackGenres,
        };
      }
    );

    const arrayTracks = await Promise.all(arrayTracksPromises);
    return arrayTracks.filter(Boolean); // Filtra cualquier resultado nulo si las promesas fallan
  };

  // Otros métodos como #getGenres, #getTracksByArtist, #getArtistParsed, #useApiFetch
  // ... (mantén el resto de tu código de Spotify.js)
  // Asegúrate de que #useApiFetch llama a tu nuevo apiFetch
  #useApiFetch = async ({ by, limit, offset, options, param }) => {
    const body = { q: param }; // Para búsqueda
    if (by === "search") {
        body.type = options[by].search; // "track" o "artist"
        body.limit = limit;
        body.offset = offset;
    } else if (by === "id") {
        body.id = param;
    }

    const result = await apiFetch({
      type: options[by].type,
      option: by === "id" ? false : options[by].search, // Ajustar option para llamadas por ID
      body: body,
    });
    return result;
  };

  #getArtistParsed = async ({ prop, isComplete = false }) => {
    const arrayArtistsPromises = (Array.isArray(prop) ? prop : [prop]).map(
      async (artist) => {
        let completeArtistData = artist;
        if (isComplete && !artist.genres) { // Si necesitamos los géneros y no están
            const fetchedArtist = await apiFetch({ type: "artist", body: { id: artist.id } });
            completeArtistData = fetchedArtist || artist;
        }

        return {
          id: completeArtistData.id,
          name: completeArtistData.name,
          image: completeArtistData.images?.[0]?.url || null,
          popularity: completeArtistData.popularity,
          genres: completeArtistData.genres || [],
        };
      }
    );
    const arrayArtists = await Promise.all(arrayArtistsPromises);
    return arrayArtists;
  };

  #getGenres = async ({ id = false, album = false, arrayArtist }) => {
    try {
      let albumComplete = !id
        ? album
        : await apiFetch({ type: "albums", body: { id } });

      const tracks = albumComplete["tracks"]?.items; // Asegúrate de acceder de forma segura

      let genres = [];
      if (albumComplete["genres"]?.length > 0) {
        genres = albumComplete["genres"];
      } else if (Array.isArray(arrayArtist)) {
        genres = arrayArtist.reduce((acc, artist) => [...acc, ...artist.genres], []);
      }

      return { tracks, genres };
    } catch (error) {
      console.log(`Hubo un error al obtener los generos ${error.message}`);
      return { error: "Genero no encontrado" };
    }
  };

  #getTracksByArtist = async ({ idArtist, genres }) => {
    const objectAlbums = await apiFetch({
      type: "artist",
      option: "albums",
      body: { id: idArtist },
    });

    const albums = objectAlbums["items"];

    const tracksAlbumsPromises = (Array.isArray(albums) ? albums : [])?.map(
      async (album) => {
        const result = await apiFetch({
          type: "albums",
          body: { id: album.id },
        });

        const tracks = result["tracks"]?.items;

        if (tracks && tracks.length > 0) {
            return await this.#getTracksParsed({
                prop: tracks,
                imageUrl: result.images[0]?.url,
                genres: result.genres?.length > 0 ? result.genres : genres,
            });
        }
        return []; // Retorna un array vacío si no hay tracks
      }
    );

    const tracksAlbums = (await Promise.all(tracksAlbumsPromises)).flat(); // Usar flat para aplanar el array de arrays de tracks

    // Obtener top tracks del artista (Spotify API)
    const topTracksResult = await apiFetch({
        type: "artist",
        option: "top-tracks",
        body: { id: idArtist, country: "US" } // Puedes cambiar el país
    });
    const topTracks = await this.#getTracksParsed({ prop: topTracksResult?.tracks || [] });

    // Combina los tracks de álbumes y los top tracks, eliminando duplicados por ID
    const combinedTracks = {};
    [...tracksAlbums, ...topTracks].forEach(track => {
        if (track && track.id) {
            combinedTracks[track.id] = track;
        }
    });

    return Object.values(combinedTracks);
  };
}

export default Spotify;