import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    artists: [{ type: String }],
    album: { type: String },
    releaseDate: { type: String },
    duration_ms: { type: Number },
    imageUrl: { type: String },
    previewUrl: { type: String },
    url: { type: String },
    genres: [{ type: String }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // si es música subida por un autor
    source: {
      type: String,
      enum: ['deezer', 'manual'],
      default: 'deezer'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Song', songSchema);
