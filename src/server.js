// server.js
import 'dotenv/config'; // Forma moderna de cargar dotenv en ES Modules
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; // Importa con .js
import authRoutes from './routes/auth.js'; // Importa con .js
import musicRoutes from './routes/music.js'; // Importa con .js
import userRoutes from './routes/user.js'; // Importa con .js
import playlistRoutes from './routes/playlist.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
connectDB();

// Configurar CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/user', userRoutes);

app.use('/api/playlist', playlistRoutes);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});