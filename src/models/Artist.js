import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  genres: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: null,
  },
  popularity: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Artist = mongoose.model('Artist', artistSchema);

export default Artist;
