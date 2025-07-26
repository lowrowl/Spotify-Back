import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  idSong: [{ type: Number }], // ← Ahora acepta IDs de Deezer
}, {
  timestamps: true,
});

export default mongoose.model('Playlist', playlistSchema);
