import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
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
  ],
});

const User = mongoose.model('User', UserSchema);
export default User; // Exportación por defecto