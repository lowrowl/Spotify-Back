import mongoose from 'mongoose';
// No es necesario 'import 'dotenv/config';' aquí si ya lo estás cargando en server.js
// y este archivo solo se conecta a la DB cuando es llamado por server.js.

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1); // Detiene la ejecución si falla la conexión
  }
};

export default connectDB;