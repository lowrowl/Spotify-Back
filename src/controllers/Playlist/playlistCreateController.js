// Importar el modelo Playlist
import Playlist from '../../models/Playlist.js';

// Función para crear una nueva playlist
export const createPlaylist = async (req, res) => {
    try {
        // Extraer información del cuerpo de la solicitud
        const { idPlaylist, name, image, idSong } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!idPlaylist ||!name ||!image ||!idSong) {
            return res.status(400).json({ message: 'Faltan datos necesarios para crear la playlist.' });
        }

        // Crear una nueva instancia de Playlist
        const playlist = new Playlist({
            idPlaylist,
            name,
            image,
            idSong,
        });

        // Guardar la nueva playlist en la base de datos
        const savedPlaylist = await playlist.save();

        // Enviar una respuesta exitosa con la playlist creada
        res.status(201).json({
            message: 'Playlist creada correctamente',
            playlist: savedPlaylist,
        });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        if (error instanceof mongoose.Error) {
            // Error de validación de Mongoose
            res.status(400).json({
                message: 'Error al crear la playlist',
                error: error.message,
            });
        } else {
            // Otros errores
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }
};