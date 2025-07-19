import Songs from '../../models/Songs.js';

async function getSongById(req, res) {
    const {id} = req.params;

    // Limpiar el id eliminando caracteres no deseados
    const cleanedId = id.replace(/\n/g, ''); // Elimina los caracteres '\n'

    try { 
        const song = await Songs.findById(cleanedId)
          .populate('idArtist')
          .select('-idArtist');
        if (!song) {
            return res.status(404).json({
                message: 'Canción no encontrada',
                code: 1, // Indicamos un error al no encontrar la canción
                description: {} // La descripción está vacía porque no hay datos para mostrar
            });
        }

        const { name, duration, genres, image, url_cancion, idArtist } = song;
        const artistName = idArtist.map(artistRef => artistRef.name).join(', ');

        // Preparar la descripción con los datos de la canción
        const description = {
            name,
            duration,
            genres,
            image,
            url_cancion,
            artistName
        };

        res.json({
            message: 'Se obtuvo la canción correctamente',
            code: 0, // Indicamos éxito al encontrar y obtener la canción
            description: description
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error interno del servidor',
            code: 1, // Indicamos un error en el proceso
            description: {} // La descripción está vacía porque hubo un error
        });
    }
}

export default getSongById;