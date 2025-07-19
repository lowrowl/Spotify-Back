import Playlist from '../../models/Playlist.js';

//Funcion para obtener playlist por Id
export const getPlaylistById = async (req, res) => {
    try {
        const { idPlaylist } = req.params;
        const playlist = await Playlist.findById(idPlaylist);
        res.status(200).json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
