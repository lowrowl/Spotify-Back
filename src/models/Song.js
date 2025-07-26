import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  cover: String,
  preview: String,
  deezerId: Number,
}, { timestamps: true });

const Song = mongoose.model('Song', songSchema);

export default Song;
