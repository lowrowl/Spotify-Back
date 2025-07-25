// src/services/apiFetch.js
import extractJSON from "../utils/ExtractJSON.js";
import { getTokenAPi } from "./getTokenApi.js"; // Importa la nueva función de obtención de token

// Asegúrate de que la ruta a endpoints.json sea correcta desde la ubicación de apiFetch.js
const endpoints = extractJSON({ path: "endpoints.json" }); // ✅ Solo el nombre del archivo
const initialQuery = "?q=";

export const apiFetch = async ({ type, option = false, body }) => {
  if (!endpoints || !endpoints[type] || !endpoints[type]["url"]) {
    console.error(`Endpoint no definido para el tipo: ${type}`);
    return { error: `Endpoint no definido para el tipo: ${type}` };
  }
  const url = endpoints[type]["url"];
  let parameters;

  if (type === "search") {
    // Si el tipo es 'search', el primer valor del cuerpo (ej. el término de búsqueda) va directo después de '?q='
    // y los demás parámetros se añaden con '&'
    parameters = initialQuery;
    const entries = Object.entries(body);

    if (entries.length > 0) {
      parameters += encodeURIComponent(entries[0][1]); // El valor de la primera entrada (query)
      for (let i = 1; i < entries.length; i++) {
        const [prop, value] = entries[i];
        const part = `${encodeURIComponent(prop)}=${encodeURIComponent(value)}`;
        parameters += `&${part}`;
      }
    }
  } else {
    // Para otros tipos (albums, tracks, artist por ID), el ID va en la URL base
    parameters = `${body["id"]}${!option ? "" : `/${option}`}`;
  }

  try {
    const accessToken = await getTokenAPi(); // Usa la nueva función para obtener el token

    if (!accessToken) {
        throw new Error("No se pudo obtener un token de acceso de Spotify.");
    }

    const response = await fetch(`${url}${parameters}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error HTTP: ${response.status} - ${errorData.error.message || response.statusText}`);
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error(
      `Hubo un error al hacer la petición a la API (${type} - ${body?.id || body?.q}). Error: ${error.message}`
    );
    return { error: error.message };
  }
};