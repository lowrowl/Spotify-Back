// Importa el modelo Songs
import Songs from '../../models/Songs.js';

class SongsByGenresController {
    constructor() {
        console.log("Creando instancia de SongsByGenresController...");
    }

    async getSongsByGenres(req, res) {
        console.log("Accediendo a getSongsByGenres");
        try {
            const { genres, offset, limit } = req.query;

            // Parsea los géneros a un arreglo si viene como una cadena
            const parsedGenres = Array.isArray(genres)? genres : genres.split(',');

            // Define el límite y salto para paginación
            const queryLimit = limit? parseInt(limit) : 10; // Si no se define un límite, usa 10 por defecto
            const skipAmount = offset? parseInt(offset) : 0; // Si no se define un offset, comienza desde el principio

            // Realiza la consulta a la base de datos
            const songs = await Songs.find({
                genres: {
                    $in: parsedGenres // Busca canciones donde alguno de los géneros coincida con los proporcionados
                }
            })
           .skip(skipAmount)
           .limit(queryLimit);

            // Retorna las canciones encontradas
            res.json({ songs });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}

export default SongsByGenresController;