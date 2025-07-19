import User from '../../models/User.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, idRol } = req.body; // Recibir el ID del rol

    // Lista de roles válidos
    const validRoles = ["1", "2"]; // "1" para Artista, "2" para Usuario

    // Verificar si el idRol proporcionado es válido
    if (!validRoles.includes(idRol)) {
      return res.status(400).json({ message: 'Rol inválido. Los roles válidos son "1" para Artista y "2" para Usuario.' });
    }

    const user = new User({ username, email, password, idRol }); // Asignar el rol
    const savedUser = await user.save();

    // Enviar un mensaje de éxito y el usuario creado, pero sin la contraseña
    res.status(201).json({ message: 'El usuario se ha creado correctamente', user: savedUser });
  } catch (error) {
    // Manejo de errores específicos
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Error de validación', error: error.message });
    } else if (error.code === 11000) {
      res.status(400).json({ message: 'Usuario ya existe', error: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
};