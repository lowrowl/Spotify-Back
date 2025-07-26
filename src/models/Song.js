const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  cover: String,        // URL de imagen
  preview: String,      // URL del fragmento de audio
  deezerId: Number,     // ID original de Deezer
}, { timestamps: true });
