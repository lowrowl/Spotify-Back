require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const musicRoutes = require('./routes/music');
const userRoutes = require('./routes/user'); // Asegúrate de que esta línea esté presente
const { getSpotifyAccessToken } = require('./utils/spotifyUtils');


const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
connectDB();

// Configurar CORS
app.use(cors({
  origin: '*', // Permitir todas las solicitudes de cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));

// Renueva el token cada 55 minutos (3300 segundos)
setInterval(async () => {
  console.log('Renovando el token de Spotify...');
  await getSpotifyAccessToken();
}, 3300 * 1000);

app.use(express.json());
app.use('/uploads', express.static('uploads')); // Servir archivos estáticos

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/user', userRoutes); // Asegúrate de que esta línea esté presente


app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  
});