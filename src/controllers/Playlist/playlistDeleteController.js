import Playlist from '../../models/Playlist.js';

export const deletePlaylist = async (req, res) => {
    try {
        const { idPlaylist } = req.body;
        const playlist = await Playlist.findById(idPlaylist);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist no encontrada' });
        }

        await Playlist.findByIdAndDelete(idPlaylist);

        res.status(200).json({ message: 'Playlist eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
