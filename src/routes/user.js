import express from 'express';
// Asumiendo que User.js está en src/models/User.js y exporta por defecto
import User from '../models/User.js'; // Ajusta la ruta a tu modelo User

const router = express.Router();

// Guardar canciones recientes
router.post('/viewed-tracks', async (req, res) => {
  const { username, track } = req.body;

  try {
    const user = await User.findOne({ username }); // Busca al usuario por username

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Evitar duplicados
    const isAlreadyViewed = user.viewedTracks.some((t) => t.id === track.id);
    if (!isAlreadyViewed) {
      user.viewedTracks.unshift(track); // Agregar al inicio
      if (user.viewedTracks.length > 10) {
        user.viewedTracks.pop(); // Limitar a 10 canciones recientes
      }
    }

    await user.save();
    res.status(200).json(user.viewedTracks);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar las canciones recientes', error });
  }
});

router.get('/viewed-tracks/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }); // Busca al usuario por username

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(user.viewedTracks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las canciones recientes', error });
  }
});

export default router; // Exportación por defecto