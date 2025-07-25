// src/services/getTokenApi.js
"use strict";
import extractJSON from "../utils/ExtractJSON.js"; // Necesitarás este util
import { configDotenv } from "dotenv";
import Token from "../models/Token.js"; // Importa el nuevo modelo Token

configDotenv(); // Carga las variables de entorno

// Asume que ../configs/endpoints.json existe y tiene una entrada 'token'
// Si no tienes endpoints.json, tendrás que poner la URL directamente aquí
const endpoints = extractJSON({ path: "./configs/endpoints.json" }); // Ruta relativa desde la raíz del proyecto o donde esté endpoints.json
const urlAuthorization = endpoints["token"]; // "https://accounts.spotify.com/api/token"

const secretsList = [
  {
    client_id: process.env.CLIENT_ID_1,
    client_secret: process.env.CLIENT_SECRET_1,
  },
  {
    client_id: process.env.CLIENT_ID_2,
    client_secret: process.env.CLIENT_SECRET_2,
  },
  {
    client_id: process.env.CLIENT_ID_3,
    client_secret: process.env.CLIENT_SECRET_3,
  },
  {
    client_id: process.env.CLIENT_ID_4,
    client_secret: process.env.CLIENT_SECRET_4,
  },
];

let currentCredentialIndex = 0; // Para rotar entre las credenciales

export const getTokenAPi = async () => {
  const secrets = secretsList[currentCredentialIndex];

  if (!secrets.client_id || !secrets.client_secret) {
    console.error("Credenciales de Spotify incompletas.");
    return false;
  }

  const now = new Date();

  // Busca el token existente para este clientId
  const existingToken = await Token.findOne({ clientId: secrets.client_id })
    .sort({ expiresAt: -1 })
    .limit(1);

  if (existingToken && existingToken.expiresAt > now) {
    // Si el token existe y no ha expirado, lo usamos y rotamos al siguiente para la próxima vez
    currentCredentialIndex = (currentCredentialIndex + 1) % secretsList.length;
    return existingToken.token;
  }

  // Si no hay token o está expirado, solicita uno nuevo
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: secrets.client_id,
      client_secret: secrets.client_secret,
    }),
  };

  try {
    const response = await fetch(urlAuthorization, options);
    const result = await response.json();

    if (!result || !result.access_token) {
      console.error("Respuesta inválida o sin token de acceso:", result);
      // Si falla con una credencial, intenta con la siguiente
      currentCredentialIndex = (currentCredentialIndex + 1) % secretsList.length;
      console.log(`Intentando con la siguiente credencial (índice: ${currentCredentialIndex}).`);
      // Vuelve a intentar con la siguiente credencial (esto podría causar un bucle si todas fallan)
      // Considera añadir un límite de reintentos o lanzar un error después de X intentos
      return await getTokenAPi(); 
    }

    const expiresAt = new Date(now.getTime() + result.expires_in * 1000); // Spotify devuelve expires_in en segundos

    // Elimina tokens antiguos para este clientId y guarda el nuevo
    await Token.deleteMany({ clientId: secrets.client_id });
    await Token.create({
      idToken: result.access_token, // Puedes usar el access_token como idToken si no hay otro ID
      clientId: secrets.client_id,
      token: result.access_token,
      expiresAt: expiresAt,
    });

    currentCredentialIndex = (currentCredentialIndex + 1) % secretsList.length; // Rota al siguiente índice
    return result.access_token;
  } catch (error) {
    console.error(`Error al obtener el token de Spotify: ${error.message}`);
    // En caso de error de red o similar, también podrías intentar con la siguiente credencial
    currentCredentialIndex = (currentCredentialIndex + 1) % secretsList.length;
    console.log(`Error de red. Intentando con la siguiente credencial (índice: ${currentCredentialIndex}).`);
    // Lanza el error si no hay más credenciales o si el reintento también falla
    throw new Error("No se pudo obtener el token de Spotify después de varios intentos.");
  }
};