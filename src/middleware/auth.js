const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
    
    // Verificar que el usuario aún existe
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(403).json({ message: 'Token inválido' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};