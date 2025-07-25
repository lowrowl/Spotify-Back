// src/services/Spotify.js
"use strict";
import { apiFetch } from "./ApiFetch.js";

class Spotify {
  constructor() {}

  getTracks = async ({ by, param, limit = 10, offset = 0 }) => {
    const byFormatted = by.toLowerCase();

    const option = {
      name: { type: "search", search: "track" },
      artist: { type: "search", search: "artist" },
      id: { type: "tracks" },
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
        if (result.error) throw new Error(result.error);
    } catch (error) {
        console.error(`Error en #useApiFetch para ${byFormatted}: ${error.message}`);
        return { error: `Error al buscar en Spotify: ${error.message}` };
    }


    try {
      let theTracks = [];

      if (byFormatted === "name") {
        const arrayTracks = result["tracks"]?.items;

        if (arrayTracks && arrayTracks.length > 0) {
            theTracks = await this.#getTracksParsed({ prop: arrayTracks });
        }
      } else if (byFormatted === "artist") {
        const idArtist = result["artists"]?.items[0]?.id;
        if (!idArtist) {
          return { error: "Artista no encontrado en Spotify." };
        }

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
            return [];
          }
        );

        const tracksAlbums = (await Promise.all(tracksAlbumsPromises)).flat();

        const topTracksResult = await apiFetch({
            type: "artist",
            option: "top-tracks",
            body: { id: idArtist, country: "US" }
        });
        const topTracks = await this.#getTracksParsed({ prop: topTracksResult?.tracks || [] });

        const combinedTracks = {};
        [...tracksAlbums, ...topTracks].forEach(track => {
            if (track && track.id) {
                combinedTracks[track.id] = track;
            }
        });
        theTracks = Object.values(combinedTracks);

      } else if (byFormatted === "id") {
        theTracks = await this.#getTracksParsed({ prop: [result] });
      }

      return theTracks;
    } catch (error) {
      console.error(`Error al procesar tracks en Spotify.js: ${error.message}`);
      return { error: `Error al procesar tracks de Spotify: ${error.message}` };
    }
  };

  #useApiFetch = async ({ by, limit, offset, options, param }) => {
    const config = options[by];

    const body = {
      q: param,
      type: config.search,
      limit,
      offset,
    };

    const result = await apiFetch({
      type: config.type,
      body: by === "id" ? { id: param } : body,
    });
    return result;
  };

  #getTracksParsed = async ({ prop, imageUrl = null, genres = [] }) => {
    return prop.map((data) => {
      const smallImage = data.album?.images?.find(img => img.height === 64)?.url || data.album?.images[0]?.url || imageUrl;
      return {
        id: data.id,
        name: data.name,
        artists: data.artists?.map((artist) => artist.name) || [],
        album: data.album?.name || '',
        releaseDate: data.album?.release_date || '',
        duration_ms: data.duration_ms,
        imageUrl: smallImage,
        previewUrl: data.preview_url,
        genres: genres,
        url: data.external_urls?.spotify || '',
      };
    });
  };
}

export default Spotify;