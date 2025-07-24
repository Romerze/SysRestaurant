const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los usuarios (solo admin)
router.get('/', requireRole(['admin']), userController.getAllUsers);

// Obtener usuario por ID (solo admin)
router.get('/:id', requireRole(['admin']), userController.getUserById);

// Crear nuevo usuario (solo admin)
router.post('/', requireRole(['admin']), userController.createUser);

// Actualizar usuario (solo admin)
router.put('/:id', requireRole(['admin']), userController.updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', requireRole(['admin']), userController.deleteUser);

module.exports = router;