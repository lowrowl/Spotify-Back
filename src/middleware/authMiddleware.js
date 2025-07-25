import jwt from 'jsonwebtoken';
// No necesitas 'require' aquí si jwt es un módulo ES o un paquete npm
// Si tienes algún problema con jwt, puede que necesites import * as jwt from 'jsonwebtoken';

const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Usa optional chaining por seguridad
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export { authenticateUser }; // Exportación nombrada