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
      if (byFormatted === "name") {
        const arrayTracks = result["tracks"]?.items;
        if (arrayTracks && arrayTracks.length > 0) {
          return await this.#getTracksParsed({ prop: arrayTracks });
        }
        return [];
      }

      if (byFormatted === "artist") {
        const artists = result["artists"]?.items || [];

        return artists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          genres: artist.genres || [],
          imageUrl: artist.images?.[0]?.url || null,
          popularity: artist.popularity,
          url: artist.external_urls?.spotify || ""
        }));
      }

      if (byFormatted === "id") {
        return await this.#getTracksParsed({ prop: [result] });
      }

      return [];
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
      const smallImage =
        data.album?.images?.find((img) => img.height === 64)?.url ||
        data.album?.images?.[0]?.url ||
        imageUrl;

      return {
        id: data.id,
        name: data.name,
        artists: data.artists?.map((artist) => artist.name) || [],
        album: data.album?.name || "",
        releaseDate: data.album?.release_date || "",
        duration_ms: data.duration_ms,
        imageUrl: smallImage,
        previewUrl: data.preview_url,
        genres: genres,
        url: data.external_urls?.spotify || "",
      };
    });
  };
}

export default Spotify;
