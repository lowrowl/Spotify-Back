// src/services/getTokenApi.js
"use strict";
import extractJSON from "../utils/ExtractJSON.js";
import { configDotenv } from "dotenv";
import Token from "../models/Token.js";
import axios from 'axios';

configDotenv();

const endpoints = extractJSON({ path: "./configs/endpoints.json" });
const urlAuthorization = endpoints["token"];

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
    client_secret: process.env.CLIENT_ID_3,
  },
  {
    client_id: process.env.CLIENT_ID_4,
    client_secret: process.env.CLIENT_ID_4,
  },
];

let currentCredentialIndex = 0;

export const getTokenAPi = async () => {
  const now = new Date();
  try {
    const existingToken = await Token.findOne({
      clientId: secretsList[currentCredentialIndex].client_id,
      expiresAt: { $gt: now },
    });

    if (existingToken) {
      console.log('Token existente y válido encontrado en la DB.');
      return existingToken.token;
    }

    const secrets = secretsList[currentCredentialIndex];
    const authHeader = Buffer.from(`${secrets.client_id}:${secrets.client_secret}`).toString('base64');

    const response = await axios.post(
      urlAuthorization,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`,
        },
      }
    );

    const result = response.data;
    if (!result || !result.access_token) {
      throw new Error(`No se pudo obtener el token de acceso. Respuesta: ${JSON.stringify(result)}`);
    }

    const expiresAt = new Date(now.getTime() + result.expires_in * 1000);

    await Token.deleteMany({ clientId: secrets.client_id });
    await Token.create({
      idToken: result.access_token,
      clientId: secrets.client_id,
      token: result.access_token,
      expiresAt: expiresAt,
    });

    currentCredentialIndex = (currentCredentialIndex + 1) % secretsList.length;
    return result.access_token;
  } catch (error) {
    console.error(`Error al obtener el token de Spotify: ${error.message}`);
    currentCredentialIndex = (currentCredentialIndex + 1) % secretsList.length;
    console.log(`Error de red. Intentando con la siguiente credencial (índice: ${currentCredentialIndex}).`);
    throw error;
  }
};