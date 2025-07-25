import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idSong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    isFavorite: { type: Boolean, default: false } // si es lista de favoritos o no
  },
  { timestamps: true }
);

export default mongoose.model('Playlist', playlistSchema);
