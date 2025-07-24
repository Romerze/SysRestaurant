const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
      const { username, fullName, password, role = 'waiter' } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'El usuario ya existe' });
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el usuario
      const user = await User.create({
        username,
        fullName,
        password: hashedPassword,
        role
      });

      // Generar token JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'tu_clave_secreta',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Buscar el usuario
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar la contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'tu_clave_secreta',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // Obtener perfil del usuario
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: ['id', 'username', 'fullName', 'role', 'createdAt']
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

module.exports = authController;