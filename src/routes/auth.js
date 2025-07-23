// filepath: c:\Users\luis3\OneDrive\Desktop\Spotify-Angular\backend\src\routes\auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El email no es válido' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email, username }, process.env.JWT_SECRET || 'secreto', { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: newUser._id, email, username }, mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Cambiado de email a username

  if (!username || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const user = await User.findOne({ username }); // Buscar por username
    if (!user) {
      return res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
    }

    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET || 'secreto', { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, username }, mensaje: 'Inicio de sesión exitoso' });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión: ' + error.message });
  }
});

module.exports = router;