import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  idSong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
}, { timestamps: true });

export default mongoose.model('Playlist', PlaylistSchema);
