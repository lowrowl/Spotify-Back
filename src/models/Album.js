import mongoose from 'mongoose';


export const AlbumSchema = new mongoose.Schema({
    idAlbum: { type: String, required: true, unique: true },
    idSong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Songs' }],
    genre : [{ type: String, required: true }],
    image : { type: String, required: true },
    popularity: { type: Number, required: true },
    idArtist: [{ type: String, required: true }]
});



