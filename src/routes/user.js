const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Guardar canciones recientes
router.post('/viewed-tracks', async (req, res) => {
  const { username, track } = req.body;

  try {
    const user = await User.findOne({ username }); // Busca al usuario por email

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
    const user = await User.findOne({ username }); // Busca al usuario por email

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(user.viewedTracks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las canciones recientes', error });
  }
});

module.exports = router;