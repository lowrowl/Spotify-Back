// src/models/Token.js
import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  idToken: { type: String, required: true, unique: true }, // Esto podría ser simplemente el token de acceso mismo
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  clientId: { type: String, required: true }, // Para saber qué credencial generó este token
});

const Token = mongoose.model("Token", TokenSchema);
export default Token;