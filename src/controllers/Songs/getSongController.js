import Spotify from '../../components/Spotify.js';
import Songs from '../../models/Songs.js';
import Artist from '../../models/Artist.js';

class SongsController {
    constructor() {
      console.log("Creando instancia de Spotify...");
      this.spotify = new Spotify();
      console.log("Instancia de Spotify creada:", this.spotify);
      
    }


    async getSongsbyName(req, res) {
        console.log("Accediendo a getSongsbyName, Spotify es:", this.spotify);
        try {
            const { name, offset } = req.params;
    
            const limit = 10; // Establece el límite a 10 elementos por página
            const skipAmount = parseInt(offset); // Convierte offset a un número entero para determinar cuántos elementos saltar
    
            // Ajusta la expresión regular para que solo coincida con canciones que comiencen con el nombre especificado
            let regex = new RegExp("^" + name, "i"); // El "^" indica el inicio de la línea, haciendo la búsqueda más precisa
    
            let dbSongs = await Songs.find({ name: { $regex: regex } }, {}, { limit: limit, skip: skipAmount });
            console.log("canciones primarias", dbSongs.length);
    
            let newSongs = [];
    
            for (let i in dbSongs) {
                if (parseInt(i) >= skipAmount) {
                    console.log("entro");
                    newSongs.push(dbSongs[i]);
                }
            }
            console.log("canciones secundarias ", newSongs.length);
    
            if (newSongs.length < limit) {
                const spotifySongs = await this.spotify.getTracks({
                    by: 'name', //Artist, //Id y por genre
                    param: name,
                    limit: limit,
                    offset: skipAmount,
                });
    
                for (const song of spotifySongs) {
                    let existingSong = await Songs.findOne({
                        name: song.name,
                        'artists.name': song.artists[0]?.name // Asume que el primer artista es el principal y tiene un nombre
                    });
    
                    if (!existingSong) {
                        const songDoc = await Songs.create({
                          ...song,
                            idArtist: []
                             // Inicializa como un array vacío
                        });
    
                        for (const artistObj of song.artists) {
                            let existingArtist = await Artist.findOne({ name: artistObj.name });
                            if (!existingArtist) {
                                existingArtist = new Artist({
                                    name: artistObj.name,
                                    genres: artistObj.genre,
                                    image: artistObj.image,
                                    popularity: artistObj.popularity
                                });
                                await existingArtist.save(); // Guarda el nuevo artista en la base de datos
                            }
    
                            songDoc.idArtist.push(existingArtist._id);
                        }
    
                        await songDoc.save();
                    }
                }
            }
            // Finalmente, retorna todas las canciones encontradas o agregadas
            // Nota: La consulta al final debería usar también una expresión regular ajustada para coincidir exactamente con el inicio del nombre
            regex = new RegExp("^" + name, "i"); // Ajusta la expresión regular aquí también si es necesario
            return res.json({ Songs: await Songs.find({ name: { $regex: regex } }, {}, { limit: limit, skip: skipAmount }) });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }


}

export default SongsController;

//luego de la petición, itero en el objeto "artists" de cada canción, itero en cada canción y guardo en la base de datos el artista obtenido, y luego obtengo el idArtist del artista que guardé y lo coloco en la propiedad idArtist en Song