import express from "express";
const router = express.Router()
import SongsController from '../controllers/Songs/getSongController.js';
import SongsByArtistController from '../controllers/Songs/getSongByArtistController.js';
import getSongById from '../controllers/Songs/getSongByIdController.js';
import SongsByGenresController  from '../controllers/Songs/getSongByGenresController.js';

const songsControllerInstanceByGenres = new SongsByGenresController();

const songsControllerInstanceByArtist = new SongsByArtistController();

const songsControllerInstance = new SongsController();


// Obtener canciones por nombre

// Middleware para instanciar el controlador y llamar al método correcto
router.get('/get-songs/:name/:offset?', (req, res ) => {
    const songsControllerInstance = new SongsController();
    songsControllerInstance.getSongsbyName(req, res);
  });
  

//Middleware para instanciar el controlador y llamar al metodo correcto para getSongsByArtist  
router.get('/get-songs-by-artist/:name/:offset?', (req, res ) => {
    const songsControllerInstanceByArtist = new SongsByArtistController();
    songsControllerInstanceByArtist.getSongsByArtist(req, res);
  });

   // Obtener canciones por Id
   router.get('/get-song/:id', getSongById);

   // Obtener canciones por generos
   router.get('/get-songs-by-genres/', songsControllerInstanceByGenres.getSongsByGenres);

export default router


