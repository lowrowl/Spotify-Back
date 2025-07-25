import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // ... (tu esquema actual de songs o idSong)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);
export default Playlist; // Exportación por defecto