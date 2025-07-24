const { User } = require('../models');
const bcrypt = require('bcryptjs');

const userController = {
  // Obtener todos los usuarios
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] }
      });
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener usuario por ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Crear nuevo usuario
  createUser: async (req, res) => {
    try {
      const { username, fullName, password, role, active } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'El usuario ya existe' });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = await User.create({
        username,
        fullName,
        password: hashedPassword,
        role: role || 'waiter',
        active: active !== undefined ? active : true
      });

      // Retornar usuario sin contraseña
      const { password: _, ...userWithoutPassword } = user.toJSON();
      res.status(201).json({ success: true, data: userWithoutPassword });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar usuario
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, fullName, password, role, active } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      // Preparar datos de actualización
      const updateData = {
        fullName: fullName || user.fullName,
        role: role || user.role,
        active: active !== undefined ? active : user.active
      };

      // Solo actualizar contraseña si se proporciona
      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Actualizar usuario
      await user.update(updateData);

      // Retornar usuario actualizado sin contraseña
      const { password: _, ...userWithoutPassword } = user.toJSON();
      res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Eliminar usuario
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      // No permitir eliminar admin
      if (user.role === 'admin') {
        return res.status(400).json({ success: false, message: 'No se puede eliminar el usuario administrador' });
      }

      await user.destroy();
      res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = userController;