const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Nuevo campo
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  viewedTracks: [
    {
      id: String,
      name: String,
      artists: String,
      album: String,
      releaseDate: String,
      imageUrl: String,
    },
  ], // Lista de canciones recientes
});

module.exports = mongoose.model('User', UserSchema);